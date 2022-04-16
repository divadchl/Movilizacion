function SearchItem(data) {
    var self = this;
    self.id = ko.observable(data.Id);
    self.description = ko.observable(data.Description);
    self.field = ko.observable(data.Field);
    self.comparerList = ko.observableArray([]);
    self.selectedComparer = ko.observable("Equals");
    self.selectedValue = ko.observable();
    self.isTerritory = ko.observable(data.IsTerritory);
    self.territoryType = ko.observable(data.TerritoryType);
    self.territoryList = ko.observableArray(data.Territory);
    self.dependant = ko.observable(data.Dependant);
    self.error = ko.observable(data.Error);
    self.value = ko.observable(data.Value);

    if (data.IsTerritory) {
        self.comparerList.push({ Id: 1, Descripcion: "igual a", Comparador: "Equals" });
    } else {
        self.comparerList.push({ Id: 1, Descripcion: "igual a", Comparador: "Equals" });
        self.comparerList.push({ Id: 2, Descripcion: "Contiene", Comparador: "Contains" });
    }

    self.selectedValue.subscribe(function (value) {
        if (value != undefined) {
            self.error(false);
        }
    });
}

function BoxItem(data) {
    var self = this;
    self.IdCasilla = ko.observable(data.IdCasilla);
    self.Casilla = ko.observable(data.Casilla);
    self.Domicilio = ko.observable(data.Domicilio);
    self.Referencia = ko.observable(data.Referencia);
    self.Ubicacion = ko.observable(data.Ubicacion);
    self.Latitud = ko.observable(data.Latitud);
    self.Longitud = ko.observable(data.Longitud);
    self.TipoCasilla = ko.observable(data.TipoCasilla);
    self.Estado = ko.observable(data.Estado);
    self.Municipio = ko.observable(data.Municipio);
    self.DistritoFederal = ko.observable(data.DistritoFederal);
    self.DistritoLocal = ko.observable(data.DistritoLocal);
    self.Seccion = ko.observable(data.Seccion);
    self.Estatus = ko.observable('Sin estatus');
    self.Comentario = ko.observable('');
    self.FechaEstatus = ko.observable('');
    self.StyleEstatus = ko.observable('badge badge-light');
    if (data.ReporteCasilla != null && data.ReporteCasilla.length > 0) {
        self.Estatus(data.ReporteCasilla[0].EstatusCasilla);
        self.Comentario(data.ReporteCasilla[0].Comentario);
        self.FechaEstatus(data.ReporteCasilla[0].Fecha);
    }

    if (self.Estatus().trim() == 'Abierta') {
        self.StyleEstatus('badge badge-success');
    }
    else if (self.Estatus().trim() == 'Cerrada') {
        self.StyleEstatus('badge badge-info');
    }
    else if (self.Estatus().trim() == 'Incidencia') {
        self.StyleEstatus('badge badge-danger');
    }

}

function FilterModel() {
    var self = this, map, marker, infoWindow, lat, lng, geocoder = new window.google.maps.Geocoder(), dragstart, dragend;
    var table = null;
    self.boxes = ko.observableArray([]);
    self.selectedBox = ko.observable(undefined);

    //INIT: FILTRO DE TERRITORIOS
    self.state = ko.observable();
    self.stateList = ko.observableArray([]);
    self.allChecked = ko.observable();
    self.searchList = ko.observableArray([]);
    self.criteria = ko.observableArray();
    self.filterList = ko.observableArray();
    self.selectedFilterList = ko.observable();
    self.getStates = function () {
        $.ajax({
            type: 'GET',
            url: '/Territory/GetStates',
            async: false,
            dataType: "json",
            contentType: "application/json; charset=utf-8",
            success: function (data) {
                self.stateList(data);
                if (data.length == 1) {
                    self.state(self.stateList()[0].Identifier);
                }
            },
            error: function (xhr, ajaxOptions, thrownError) {

            }
        });
    };
    self.reset = function () {
        self.searchList.removeAll();
        self.criteria([]);
        self.initFilter();
        self.boxes([]);
        if (table != null) {
            table.clear();
            table.destroy();
            table = null;
        }
    };
    self.initFilter = function () {
        self.filterList([
            { Id: 2, Description: 'Municipio', Field: "IdMunicipio", IsTerritory: true, TerritoryType: 2, Territory: [], Dependant: 0, Error: false },
            { Id: 3, Description: 'Distrito Federal', Field: "IdDistritoFederal", IsTerritory: true, TerritoryType: 3, Territory: [], Dependant: 0, Error: false },
            { Id: 4, Description: 'Distrito Local', Field: "IdDistritoLocal", IsTerritory: true, TerritoryType: 4, Territory: [], Dependant: 0, Error: false },
            { Id: 5, Description: 'Seccion', Field: "IdSeccion", IsTerritory: true, TerritoryType: 5, Territory: [], Dependant: 0, Error: false },
        ]);
    };
    self.state.subscribe(function () {
        self.reset();
        self.allChecked(false);
        if (table != null) {
            table.clear();
            table.destroy();
            table = null;
        }
    });
    self.allChecked.subscribe(function (value) {
        if (value) {
            self.reset();
            self.criteria([]);
            self.search();
        }
        else {
            self.boxes([]);
            if (table != null) {
                table.clear();
                table.destroy();
                table = null;
            }
        }
    });
    self.selectedFilterList.subscribe(function (selected) {
        if (selected == undefined) return;
        if (selected.IsTerritory) {
            var slt = $.grep(self.searchList(), function (item) {
                return item.isTerritory() && item.selectedValue() != undefined;
            });
            var ter = [{
                Activo: false,
                Descripcion: '',
                Firma: '',
                Id: self.state(),
                TipoTerritorio: 1
            }];
            $.each(slt, function (i, item) {
                ter.push({
                    Activo: false,
                    Descripcion: item.description(),
                    Firma: '',
                    Id: item.selectedValue(),
                    TipoTerritorio: item.territoryType()
                });
            });
            var stack = JSON.stringify(ter);
            $.ajax({
                type: 'POST',
                url: '/Territory/StackTerritory',
                data: { stack: stack, tipo: selected.TerritoryType },
                async: false,
                success: function (data) {
                    selected.Territory = data.Lista;
                    var item = new SearchItem(selected);
                    self.searchList.push(item);
                    self.allChecked(false);
                },
                error: function (xhr, ajaxOptions, thrownError) {
                    alert(xhr.status);
                    alert(thrownError);
                }
            });
        } else {
            var search = new SearchItem(selected);
            self.searchList.push(search);
        }

        self.removeFilterList(selected.Id);
    });
    self.initFilterList = function (data) {
        var mapped = $.map(data.Elementos[0].Propiedades, function (item, i) {
            return {
                Id: i + 1,
                Description: item.ColumName,
                Field: item.PropertyName,
                IsTerritory: item.Territory != 0,
                TerritoryType: item.Territory,
                Territory: [],
                Dependant: 0,
                Error: false
            };
        });
        self.filterList(mapped);
    };
    self.removeFilterList = function (tipoFiltro) {
        var index = -22;
        $.each(self.filterList(), function (i, el) {
            if (el.Id == tipoFiltro)
                index = i;
        });
        if (index != -22)
            self.filterList.splice(index, 1);
    };
    //END: FILTRO DE TERRITORIOS

    self.search = function () {
        var count = 0;
        $.each(self.searchList(), function (i, item) {
            var value = item.selectedValue();
            if (value == undefined || value == '') {
                count++;
                item.error(true);
            }
        });
        if (count > 0) {
            alert("Campos Requeridos");
            return;
        }

        var criteria = $.map(self.searchList(), function (item) {
            if (item.selectedValue() == undefined) return null;
            return {
                PropertyName: item.field(),
                Comparer: item.selectedComparer(),
                Value: item.isTerritory() ? parseInt(item.selectedValue()) : item.selectedValue()
            };
        });
        criteria.push({
            PropertyName: 'IdEstado',
            Comparer: 'Equals',
            Value: self.state()
        });
        self.criteria(criteria);
        self.getData();
    };

    self.getData = function () {
        if (table != null) {
            table.clear();
            table.destroy();
            table = null;
        }

        $.ajax({
            type: 'Post',
            url: '/Deteccion/BoxesList',
            data: ko.toJSON({ criteria: self.criteria() }),
            async: false,
            dataType: "json",
            contentType: "application/json; charset=utf-8",
            success: function (data) {
                self.boxes([]);
                $.each(data, function (i, el) {
                    self.boxes.push(new BoxItem(el));
                });
            },
            error: function (xhr, ajaxOptions, thrownError) {
                alert('error');
            }
        });

        self.initTable();
    };

    self.initTable = function () {
        table = $('#boxesTable').DataTable({
            'paging': true,
            'ordering': false,
            'info': true,
            responsive: true,
            //destroy: true,
            oLanguage: {
                sSearch: '<em class="fas fa-search"></em>',
                sLengthMenu: '_MENU_ filas por página',
                info: 'Mostrándo página _PAGE_ de _PAGES_',
                zeroRecords: 'Sin resultado',
                infoEmpty: 'No hay registros disponibles',
                infoFiltered: '(Filtrado de _MAX_ filas totales)',
                sEmptyTable: "No hay datos disponibles",
                sInfo: "Mostrándo _START_ de _END_ de _TOTAL_ registros",
                oPaginate: {
                    sNext: '<em class="fa fa-caret-right"></em>',
                    sPrevious: '<em class="fa fa-caret-left"></em>'
                }
            },
            dom: 'Bfrtip',
            buttons: [
                //{ extend: 'copy', className: 'btn-info' },
                { extend: 'csv', className: 'btn-info' },
                { extend: 'excel', className: 'btn-info', title: 'XLS-File' },
                { extend: 'pdf', className: 'btn-info', title: $('title').text() },
                //{ extend: 'print', className: 'btn-info' }
            ]
        });
    };

    self.locate = function (data) {
        self.selectedBox(data);
        var lat = data.Latitud();
        var lng = data.Longitud();
        if (lat == 0 && lng == 0) {
            alert('No disponible para esta casilla');
            return;
        }
        self.initIndividualMap(lat, lng, 'locateMap');
    };

    self.initIndividualMap = function (lat, lng, controlName) {
        var latlng = new window.google.maps.LatLng(lat, lng);
        var myOptions = {
            zoom: 16,
            center: latlng,
            mapTypeId: window.google.maps.MapTypeId.ROADMAP
        };
        map = new window.google.maps.Map(document.getElementById(controlName), myOptions);

        marker = new window.google.maps.Marker({
            position: latlng,
            map: map,
            draggable: true,
            animation: window.google.maps.Animation.DROP
        });

        dragstart = window.google.maps.event.addListener(marker, 'dragstart', function () {
            infoWindow.close();
        });

        dragend = window.google.maps.event.addListener(marker, 'dragend', function () {
            var point = marker.getPosition();
            self.findAddress('', point);
        });

        google.maps.event.addListener(marker, 'click', function () {
            window.open('https://www.google.com/maps/search/?api=1&query=' + lat + ',' + lng);
        });
    };

    self.getStates();
    self.initFilter();
}


$(function () {
    var model = new FilterModel();
    ko.applyBindings(model);
});