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

function ProcessItem(data) {
    var self = this;
    self.IdProceso = ko.observable(data.IdProceso);
    self.Proceso = ko.observable(data.Proceso);
    self.IsLocal = ko.observable(data.IsLocal);
    self.FechaProceso = ko.observable(data.FechaProceso);
    self.Activo = ko.observable(data.Activo);
    self.IdEstado = ko.observable(data.IdEstado);
    self.Estado = ko.observable(data.Estado);
    self.IdEncarte = ko.observable(data.IdEncarte);
}

function ViewModel() {
    var self = this;
    var processTable = null;
    self.processList = ko.observableArray([]);
    self.selectedProcess = ko.observable(undefined);
    self.encarteList = ko.observableArray([]);
    self.selectedEncarte = ko.observable(undefined);

    self.processName = ko.observable('');
    self.fechaProceso = ko.observable('');
    self.processType = ko.observable('1');

    self.getEncartes = function () {
        $.ajax({
            type: 'GET',
            url: '/Configuration/GetEncartes',
            async: false,
            dataType: "json",
            contentType: "application/json; charset=utf-8",
            success: function (data) {
                self.encarteList(data);
                if (data.length == 1) {
                    self.selectedEncarte(self.encarteList()[0].Identifier);
                }
            },
            error: function (xhr, ajaxOptions, thrownError) {

            }
        });
    };

    //INIT: FILTRO DE PROCESOS - PÁGINA PRINCIPAL
    self.principalState = ko.observable();
    self.statePrincipalList = ko.observableArray([]);
    self.allChecked = ko.observable();
    self.searchPrincipalList = ko.observableArray([]);
    self.criteria = ko.observableArray();
    self.filterPrincipalList = ko.observableArray();
    self.selectedPrincipalFilterList = ko.observable();
    self.getStates = function () {
        $.ajax({
            type: 'GET',
            url: '/Territory/GetStates',
            async: false,
            dataType: "json",
            contentType: "application/json; charset=utf-8",
            success: function (data) {
                self.statePrincipalList(data);
                if (data.length == 1) {
                    self.principalState(self.statePrincipalList()[0].Identifier);
                }
            },
            error: function (xhr, ajaxOptions, thrownError) {

            }
        });
    };
    self.reset = function () {
        self.searchPrincipalList.removeAll();
        self.criteria([]);
        self.initFilter();
        self.processList([]);
        if (processTable != null) {
            processTable.clear();
            processTable.destroy();
            processTable = null;
        }
    };
    self.initFilter = function () {
        self.filterPrincipalList([
            { Id: 2, Description: 'Municipio', Field: "IdMunicipio", IsTerritory: true, TerritoryType: 2, Territory: [], Dependant: 0, Error: false },
            { Id: 3, Description: 'Distrito Federal', Field: "IdDistritoFederal", IsTerritory: true, TerritoryType: 3, Territory: [], Dependant: 0, Error: false },
            { Id: 4, Description: 'Distrito Local', Field: "IdDistritoLocal", IsTerritory: true, TerritoryType: 4, Territory: [], Dependant: 0, Error: false },
            //{ Id: 5, Description: 'Seccion', Field: "IdSeccion", IsTerritory: true, TerritoryType: 5, Territory: [], Dependant: 0, Error: false },
        ]);
    };
    self.principalState.subscribe(function () {
        self.reset();
        self.allChecked(false);
        if (processTable != null) {
            processTable.clear();
            processTable.destroy();
            processTable = null;
        }
    });
    self.allChecked.subscribe(function (value) {
        if (value) {
            self.reset();
            self.criteria([]);
            self.search();
        }
        else {
            self.processList([]);
            if (processTable != null) {
                processTable.clear();
                processTable.destroy();
                processTable = null;
            }
        }
    });
    self.selectedPrincipalFilterList.subscribe(function (selected) {
        if (selected == undefined) return;
        if (selected.IsTerritory) {
            var slt = $.grep(self.searchPrincipalList(), function (item) {
                return item.isTerritory() && item.selectedValue() != undefined;
            });
            var ter = [{
                Activo: false,
                Descripcion: '',
                Firma: '',
                Id: self.principalState(),
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
                    self.searchPrincipalList.push(item);
                    self.allChecked(false);
                },
                error: function (xhr, ajaxOptions, thrownError) {
                    alert(xhr.status);
                    alert(thrownError);
                }
            });
        } else {
            var search = new SearchItem(selected);
            self.searchPrincipalList.push(search);
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
        self.filterPrincipalList(mapped);
    };
    self.removeFilterList = function (tipoFiltro) {
        var index = -22;
        $.each(self.filterPrincipalList(), function (i, el) {
            if (el.Id == tipoFiltro)
                index = i;
        });
        if (index != -22)
            self.filterPrincipalList.splice(index, 1);
    };
    //END: FILTRO DE PROCESOS

    //INIT: FILTRO DE PROCESOS - ADD/EDIT
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
    //END: FILTRO DE PROCESOS

    self.search = function () {
        var count = 0;
        $.each(self.searchPrincipalList(), function (i, item) {
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

        var criteria = $.map(self.searchPrincipalList(), function (item) {
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
            Value: self.principalState()
        });
        self.criteria(criteria);
        self.getData();
    };
    self.getData = function () {
        if (processTable != null) {
            processTable.clear();
            processTable.destroy();
            processTable = null;
        }

        $.ajax({
            type: 'Post',
            url: '/Configuration/GetProcess',
            async: false,
            data: ko.toJSON({ criteria: self.criteria() }),
            dataType: "json",
            contentType: "application/json; charset=utf-8",
            success: function (data) {
                self.processList([]);
                $.each(data, function (i, el) {
                    self.processList.push(new ProcessItem(el));
                });
            },
            error: function (xhr, ajaxOptions, thrownError) {
                alert('error');
            }
        });

        self.initTable();
    };

    self.initTable = function () {
        processTable = $('#procesosTable').DataTable({
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


    self.confirmChangeStatusProcess = function (e) {
        swal({
            title: e.Activo() ? '¿Desea desactivar el proceso?' : '¿Desea activar el proceso?',
            text: e.Activo() ? '¡La proceso será desactivado!' : '¡La proceso se activará!',
            icon: e.Activo() ? 'warning' : 'info',
            buttons: {
                cancel: true,
                confirm: {
                    text: 'Si',
                    value: true,
                    visible: true,
                    className: e.Activo() ? "bg-danger" : 'bg-info',
                    closeModal: true
                }
            }
        }).then(function (isConfirm) {
            if (isConfirm) {
                self.processChangeStatus(e);
            }
        });
    };
    self.processChangeStatus = function (data) {
        var idProceso = data.IdProceso();
        $.ajax({
            type: 'POST',
            url: '/Configuration/ChangeStatusProcess',
            data: ko.toJSON({ idProceso: idProceso }),
            async: false,
            dataType: "json",
            contentType: "application/json; charset=utf-8",
            success: function (r) {
                data.Activo(!data.Activo());
            },
            error: function (xhr, ajaxOptions, thrownError) {

            }
        });
    };

    self.processValidate = function () {
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

    self.editProcess = function (data) {
        self.selectedProcess(data);
        self.processName(data.Proceso());
    };

    self.processChanges = function () {
        if (self.selectedProcess() == undefined) {
            self.saveNewProcess();
        }
        else {
            self.saveEditProcess();
        }
    };

    self.saveNewProcess = function () {
        var error = false;
        if (self.processName() == undefined || self.processName().trim() == '') {
            $('#processName').attr('required', 'required');
            error = true;
        }
        else {
            $('#processName').removeAttr('required');
        }

        if (self.fechaProceso() == undefined || self.fechaProceso().trim() == '') {
            $('#fechaProceso').attr('required', 'required');
            error = true;
        }
        else {
            $('#fechaProceso').removeAttr('required');
        }

        var responseValidate = self.processValidate();
        if (responseValidate) {
            return;
        }

        if (error) {
            //alert('Hay campos requeridos');
        }
        else {
            $('#processName').removeAttr('required');
            $('#encarte').removeAttr('required');
            $('#fechaProceso').removeAttr('required');
            $('#newProcess').modal('hide');

            var processInfo = {
                Proceso: self.processName(),
                IsLocal: self.processType() == 1,
                FechaProceso: self.fechaProceso(),
                IdEstado: self.addEditState(),
                IdEncarte: self.selectedEncarte()
            };

            $.ajax({
                type: 'Post',
                url: '/Configuration/SaveProcess',
                data: ko.toJSON({ proceso: processInfo }),
                async: false,
                dataType: "json",
                contentType: "application/json; charset=utf-8",
                success: function (data) {
                    self.showAlertMessage('Proceso creado correctamente');
                    self.search();
                    self.resetNewProcess();
                },
                error: function (xhr, ajaxOptions, thrownError) {
                    alert('error');
                }
            });
        }
    };

    self.saveEditProcess = function () {
        var error = false;
        if (self.processName() == undefined || self.processName().trim() == '') {
            $('#processName').attr('required', 'required');
            error = true;
        }
        else {
            $('#processName').removeAttr('required');
        }


        if (error) {
            //alert('Hay campos requeridos');
        }
        else {
            $('#processName').removeAttr('required');
            $('#newProcess').modal('hide');
            var processName = self.processName();
            var processId = self.selectedProcess().IdProceso();
            $.ajax({
                type: 'Post',
                url: '/Configuration/EditProcess',
                data: ko.toJSON({ idProceso: processId, name: processName }),
                async: false,
                dataType: "json",
                contentType: "application/json; charset=utf-8",
                success: function (data) {
                    self.showAlertMessage('Proceso actualizado correctamente');
                    self.selectedProcess().Proceso(processName);
                    self.resetNewProcess();
                },
                error: function (xhr, ajaxOptions, thrownError) {
                    alert('error');
                }
            });
        }
    };

    self.resetNewProcess = function () {
        self.processName('');
        self.fechaProceso('');
        self.addEditReset();
        self.selectedEncarte(undefined);
    };

    self.initValuesNewProcess = function () {
        self.getAddEditStates();
        self.addEditInitFilter();
        self.selectedProcess(undefined);
        self.processName('');
        self.fechaProceso('');
        self.getEncartes();
    };


    self.showAlertMessage = function (message) {
        swal(message, "", "success");
    };

    $('#datetimepicker1').datepicker({
        format: 'dd/mm/yyyy',
        autoclose: true
    });

    self.getStates();
    self.initFilter();
}


$(function () {
    var model = new ViewModel();
    ko.applyBindings(model);
});
