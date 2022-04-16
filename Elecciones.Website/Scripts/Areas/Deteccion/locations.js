
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

function FilterModel() {
    var self = this, map, geocoder = new window.google.maps.Geocoder(), dragstart, dragend;
    var timer;
    var timeNextTag = 30000;//30 segundos en milimetros

    map = null;
    self.FiltroList = [{ Identifier: 1, Description: 'Casillas' }, { Identifier: 2, Description: 'Personas' }, { Identifier: 3, Description: 'Ambos' }];
    self.selectedFilter = ko.observable(undefined);

    self.hideFilter = ko.observable(false);
    self.changeFilterStatus = function () {
        self.hideFilter(!self.hideFilter());
    };

    self.locations = ko.observableArray();
    self.boxes = ko.observableArray();
    self.info = ko.observable();
    self.selectedMap = ko.observable(true);
    self.clickPoint = ko.computed(function () {
        return self.selectedMap() == true && (self.info() != undefined && self.info().getMap() != null);
    });
    var markers = [];
    var iconPin = 'data:image/png;base64,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';

    //INIT: FILTRO DE TERRITORIOS
    self.state = ko.observable();
    self.stateList = ko.observableArray([]);
    self.allChecked = ko.observable();
    self.searchList = ko.observableArray([]);
    self.criteria = ko.observableArray();
    self.persons = ko.observableArray([]);
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
    });
    self.allChecked.subscribe(function (value) {
        if (value) {
            self.reset();
            self.criteria([]);
            self.search();
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

        self.clearMap();

        var identifierFilter = self.selectedFilter();
        if (identifierFilter == 1) {
            self.getBoxes();
        }
        else if (identifierFilter == 2) {
            self.getPersons();
        }
        else if (identifierFilter == 3) {
            self.getBoxes();
            self.getPersons();
        }

        timer = window.setTimeout(function () {
            self.search();
        }, timeNextTag);

    };

    self.getPersons = function () {
        $.ajax({
            type: 'POST',
            url: '/Deteccion/LocationList',
            data: ko.toJSON({ criteria: self.criteria() }),
            async: false,
            dataType: "json",
            contentType: "application/json; charset=utf-8",
            success: function (data) {
                self.locations(data);
            },
            error: function (xhr, ajaxOptions, thrownError) {

            }
        });

        var locations = [];
        $.each(self.locations(), function (i, item) {
            locations.push({
                NombreCompleto: item.Nombre + ' ' + item.Paterno + ' ' + item.Materno,
                Latitud: item.Latitud,
                Longitud: item.Longitud,
                Color: item.Contactos.length > 0 ? item.Contactos[0].Color : 'Azul',
                Estatus: item.Contactos.length > 0 ? item.Contactos[0].Estatus : 'No contactado',
                Domicilio: item.Calle + " " + item.NoExterior + " " + item.Colonia + " " + item.CodigoPostal + " " + item.Estado
            });
        });
        self.initMultipleMap(locations, 'Persons', 'locateMap');
    };

    self.getBoxes = function () {
        $.ajax({
            type: 'POST',
            url: '/Deteccion/BoxesList',
            data: ko.toJSON({ criteria: self.criteria() }),
            async: false,
            dataType: "json",
            contentType: "application/json; charset=utf-8",
            success: function (data) {
                self.boxes(data);
            },
            error: function (xhr, ajaxOptions, thrownError) {

            }
        });

        var locations = [];
        $.each(self.boxes(), function (i, item) {
            locations.push({
                IdCasilla: item.IdCasilla,
                Casilla: item.Casilla,
                Domicilio: item.Domicilio,
                Latitud: item.Latitud,
                Longitud: item.Longitud,
                Color: item.ReporteCasilla.length > 0 ? item.ReporteCasilla[0].ColorEstatusCasilla : 'Verde',
                Estatus: item.ReporteCasilla.length > 0 ? item.ReporteCasilla[0].EstatusCasilla : '',
                Comentario: item.ReporteCasilla.length > 0 ? item.ReporteCasilla[0].Comentario : '',
            });
        });
        self.initMultipleMap(locations, 'Boxes', 'locateMap');
    };

    self.initMultipleMap = function (locations, identifier, controlName) {

        if (map == null) {
            map = new google.maps.Map(document.getElementById(controlName), {
                zoom: 16,
                center: new google.maps.LatLng(locations[0].Latitud, locations[0].Longitud),
                mapTypeId: google.maps.MapTypeId.ROADMAP
            });
        }

        $.each(locations, function (i, item) {
            var marker = null;
            var content = '';
            if (identifier == 'Boxes') {
                content = '<div id="iw-container">' +
                    '<div class="iw-title">Información de Casilla</div>' +
                    '<div class="iw-content">' +
                    '<p><b>CASILLA:</b>' + item.Casilla + '</p>' +
                    '<p><b>DOMICILIO:</b>' + item.Domicilio + '</p>' +
                    '<p><a href=\'https://www.google.com/maps/search/?api=1&query=' + item.Latitud + ',' + item.Longitud +'\' target=\'_blank\'><img class=\'pointer\' style=\'width: 32px; height: 32px;\' src=\'' + iconPin + '\' ></img></a></p>' +
                    '<p><b>Estatus:</b>' + item.Estatus + '</p>' +
                    '<p><b>Comentario:</b>' + item.Comentario + '</p>' +
                    '</div>' +
                    '<div class="iw-bottom-gradient"></div>' +
                    '</div>';
            }
            else if (identifier == 'Persons') {

                content = '<div id="iw-container">' +
                    '<div class="iw-title">Información de la persona</div>' +
                    '<div class="iw-content">' +
                    '<p><b>Nombre:</b>' + item.NombreCompleto + '</p>' +
                    '<p><b>Domicilio:</b>' + item.Domicilio + '</p>' +
                    '<p><a href=\'https://www.google.com/maps/search/?api=1&query=' + item.Latitud + ',' + item.Longitud + '\' target=\'_blank\'><img class=\'pointer\' style=\'width: 32px; height: 32px;\' src=\'' + iconPin + '\' ></img></a></p>' +
                    '<p><b>Estatus:</b>' + item.Estatus + '</p>' +
                    '</div>' +
                    '<div class="iw-bottom-gradient"></div>' +
                    '</div>';
            }

            //
            var infowindow = new window.google.maps.InfoWindow({
                content: content
            });

            google.maps.event.addListener(infowindow, 'domready', function () {
                var iwOuter = $('.gm-style-iw');
                var iwBackground = iwOuter.prev();
                iwBackground.children(':nth-child(2)').css({
                    'display': 'none'
                });
                iwBackground.children(':nth-child(4)').css({
                    'display': 'none'
                });
                iwOuter.parent().parent().css({ left: '115px' });
                iwBackground.children(':nth-child(1)').attr('style', function (i, s) { return s + 'left: 76px !important;' });
                iwBackground.children(':nth-child(3)').attr('style', function (i, s) { return s + 'left: 76px !important;' });
                iwBackground.children(':nth-child(3)').find('div').children().css({ 'box-shadow': 'rgba(80, 85, 89, 0.6) 0px 1px 6px', 'z-index': '1' });
                var iwCloseBtn = iwOuter.next();
                iwCloseBtn.css({ opacity: '1', right: '63px', top: '23px', border: '1px solid #505559', 'border-radius': '0px', 'width': '16px', 'height': '16px' });
                if ($('.iw-content').height() < 140) {
                    $('.iw-bottom-gradient').css({ display: 'none' });
                }
                iwCloseBtn.mouseout(function () {
                    $(this).css({ opacity: '1' });
                });
            });

            var latLng = new window.google.maps.LatLng(locations[i].Latitud, locations[i].Longitud);
            marker = new google.maps.Marker({
                position: latLng,
                map: map,
                icon: identifier == 'Boxes' ? '/Content/Images/icons/ine' + item.Color + '.png' : '/Content/Images/icons/persona' + item.Color + '.fw.png',
                draggable: false,
                //animation: window.google.maps.Animation.DROP,
            });
            markers.push(marker);

            window.google.maps.event.addListener(marker, 'click', function () {
                if (self.info() != undefined) {
                    self.info().close();
                    self.info(null);
                }

                infowindow.open(map, marker);
                //infowindow.setPosition(marker.getPosition());

                self.info(infowindow);
            });

            window.google.maps.event.addListener(infowindow, 'closeclick', function () {
                //self.info().setMap(null);
                self.info(null);
                //self.removePoints();
            });

        });



    };

    self.clearMap = function () {
        $.each(markers, function (i, item) {
            item.setMap(null);
        });
        markers = [];
    };

    self.getStates();
    self.initFilter();

}

$(function () {
    var model = new FilterModel();
    ko.applyBindings(model);
});