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

function NotificationItem(data) {
    var self = this;
    self.Id = ko.observable(data.Id);
    self.Titulo = ko.observable(data.Titulo);
    self.Mensaje = ko.observable(data.Mensaje);
    self.Aplicacion = ko.observable(data.Aplicacion);
    self.Territorio = ko.observable(data.Territorio);
    self.Enviada = ko.observable(data.Enviada ? 'SI' : 'NO');
    self.Fecha = ko.observable(data.Fecha);
}

function FilterModel() {
    var self = this;
    var table = null;
    self.notificaciones = ko.observableArray([]);
    self.aplicaciones = ko.observableArray();
    self.aplicaciones.push({ Identifier: 1, Application: 'MyDet' });
    self.aplicaciones.push({ Identifier: 2, Application: 'MyMov' });

    self.selectedApplication = ko.observable();

    self.title = ko.observable('');
    self.message = ko.observable('');

    self.getNotifications = function () {
        if (table != null) {
            table.clear();
            table.destroy();
            table = null;
        }

        $.ajax({
            type: 'Post',
            url: '/Notifications/GetNotifications',
            async: false,
            dataType: "json",
            contentType: "application/json; charset=utf-8",
            success: function (res) {
                self.notificaciones([]);
                $.each(res, function (i, el) {
                    var notification = new NotificationItem(el);
                    self.notificaciones.push(notification);
                });
            },
            error: function (xhr, ajaxOptions, thrownError) {
                alert('error');
            }
        });

        self.initTable();
    };

    self.initTable = function () {
        table = $('#notificationsTable').DataTable({
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
            }
        });
    };

    self.initValuesNewNotification = function () {
        self.title('');
        self.message('');
        self.selectedApplication(undefined);
        self.getAddEditStates();
    };

    //INIT: FILTRO DE TERRITORIOS - ADD/EDIT
    self.addEditState = ko.observable();
    self.stateAddEditList = ko.observableArray([]);
    self.searchAddEditList = ko.observableArray([]);
    self.addEditcriteria = ko.observableArray();
    self.filterAddEditList = ko.observableArray();
    self.selectedAddEditFilterList = ko.observable();
    self.getAddEditStates = function () {
        $.ajax({
            type: 'GET',
            url: '/Territory/GetStates',
            async: false,
            dataType: "json",
            contentType: "application/json; charset=utf-8",
            success: function (data) {
                self.stateAddEditList(data);
                if (data.length == 1) {
                    self.addEditState(self.stateAddEditList()[0].Identifier);
                }
            },
            error: function (xhr, ajaxOptions, thrownError) {

            }
        });
    };
    self.addEditReset = function () {
        self.searchAddEditList.removeAll();
        self.addEditcriteria([]);
        self.addEditInitFilter();
    };
    self.addEditInitFilter = function () {
        self.filterAddEditList([
            { Id: 2, Description: 'Municipio', Field: "IdMunicipio", IsTerritory: true, TerritoryType: 2, Territory: [], Dependant: 0, Error: false },
            { Id: 3, Description: 'Distrito Federal', Field: "IdDistritoFederal", IsTerritory: true, TerritoryType: 3, Territory: [], Dependant: 0, Error: false },
            { Id: 4, Description: 'Distrito Local', Field: "IdDistritoLocal", IsTerritory: true, TerritoryType: 4, Territory: [], Dependant: 0, Error: false },
            //{ Id: 5, Description: 'Sección', Field: "IdSeccion", IsTerritory: true, TerritoryType: 5, Territory: [], Dependant: 0, Error: false },
        ]);
    };
    self.addEditState.subscribe(function () {
        self.addEditReset();
    });
    self.selectedAddEditFilterList.subscribe(function (selected) {
        if (selected == undefined) return;
        if (selected.IsTerritory) {
            var slt = $.grep(self.searchAddEditList(), function (item) {
                return item.isTerritory() && item.selectedValue() != undefined;
            });
            var ter = [{
                Activo: false,
                Descripcion: '',
                Firma: '',
                Id: self.addEditState(),
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
                    self.searchAddEditList.push(item);
                },
                error: function (xhr, ajaxOptions, thrownError) {
                    alert(xhr.status);
                    alert(thrownError);
                }
            });
        } else {
            var search = new SearchItem(selected);
            self.searchAddEditList.push(search);
        }

        self.addEditRemoveFilterList(selected.Id);
    });
    self.addEditInitFilterList = function (data) {
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
        self.filterAddEditList(mapped);
    };
    self.addEditRemoveFilterList = function (tipoFiltro) {
        var index = -22;
        $.each(self.filterAddEditList(), function (i, el) {
            if (el.Id == tipoFiltro)
                index = i;
        });
        if (index != -22)
            self.filterAddEditList.splice(index, 1);
    };
    //END: FILTRO DE TERRITORIOS

    self.validateTerritory = function () {
        var count = 0;
        $.each(self.searchAddEditList(), function (i, item) {
            var value = item.selectedValue();
            if (value == undefined || value == '') {
                count++;
                item.error(true);
            }
        });
        if (count > 0) {
            alert("Campos Requeridos");
            return true;
        }

        return false;
    };

    self.sendNotification = function () {
        var error = false;
        if (self.message() == undefined || self.message().trim() == '') {
            $('#message').attr('required', 'required');
            error = true;
        }
        else {
            $('#message').removeAttr('required');
        }

        if (self.title() == undefined || self.title().trim() == '') {
            $('#title').attr('required', 'required');
            error = true;
        }
        else {
            $('#title').removeAttr('required');
        }

        var responseValidate = self.validateTerritory();
        if (responseValidate) {
            return;
        }

        if (error) {
            //alert('Hay campos requeridos');
        }
        else {
            $('#message').removeAttr('required');
            $('#link').removeAttr('required');
            $('#newNotification').modal('hide');

            var title = self.title();
            var message = self.message();
            var application = self.selectedApplication();
            var criteria = $.map(self.searchAddEditList(), function (item) {
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
                Value: self.addEditState()
            });

            var notification = {
                Titulo: title,
                Mensaje: message, 
                Aplicacion: application
            };

            $.ajax({
                type: 'Post',
                url: '/Notifications/CreateNotification',
                data: ko.toJSON({ criteria: criteria, notification: notification }),
                async: false,
                dataType: "json",
                contentType: "application/json; charset=utf-8",
                success: function (data) {
                    self.showAlertMessage('Notificación enviada correctamente');
                    self.getNotifications();
                },
                error: function (xhr, ajaxOptions, thrownError) {
                    alert('error');
                }
            });

        }
    };

    self.showAlertMessage = function (message) {
        swal(message, "", "success");
    };

    self.getNotifications();
}


$(function () {
    var model = new FilterModel();
    ko.applyBindings(model);

    model.getUsers();
    model.generalInformation(window.generalInformation);
});
