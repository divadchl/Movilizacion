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

function NewItem(data) {
    var self = this;
    self.IdNoticia = ko.observable(data.IdNoticia);
    self.Titulo = ko.observable(data.Titulo);
    self.Link = ko.observable(data.Link);
    self.Activo = ko.observable(data.Activo);
    self.Territorio = ko.observable(data.Territorio);
    self.Date = ko.observable(data.Date);
}

function ViewModel() {
    var self = this;
    var table = null;
    self.divPrincipalVisible = ko.observable(true);

    self.news = ko.observableArray([]);
    self.selectedNew = ko.observable(undefined);
    self.title = ko.observable('');
    self.link = ko.observable('');

    //INIT: FILTRO DE TERRITORIOS - PÁGINA PRINCIPAL
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
        self.news([]);
        if (table != null) {
            table.clear();
            table.destroy();
            table = null;
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
            self.news([]);
            if (table != null) {
                table.clear();
                table.destroy();
                table = null;
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
    //END: FILTRO DE TERRITORIOS

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
        if (table != null) {
            table.clear();
            table.destroy();
            table = null;
        }

        $.ajax({
            type: 'Post',
            url: '/News/GetNews',
            data: ko.toJSON({ criteria: self.criteria() }),
            async: false,
            dataType: "json",
            contentType: "application/json; charset=utf-8",
            success: function (data) {
                self.news([]);
                $.each(data, function (i, el) {
                    self.news.push(new NewItem(el));
                });
                self.initTable();
            },
            error: function (xhr, ajaxOptions, thrownError) {
                alert('error');
            }
        });
    };
    self.initTable = function () {
        table = $('#noticiasTable').DataTable({
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

    //INIT: NOTICIAS
    self.editNew = function (data) {
        self.selectedNew(data);
        self.link(data.Nombre());
        self.title(data.Vigencia());
        //Si se desea agregar territorios, se debe inicializar con "" y mostrar la sección y asignar valores
    };
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
    self.newChanges = function () {
        if (self.selectedNew() == undefined) {
            self.saveNewNew();
        }
        else {
            self.saveEditNew();
        }
    };
    self.saveNewNew = function () {
        var error = false;
        if (self.link() == undefined || self.link().trim() == '') {
            $('#link').attr('required', 'required');
            error = true;
        }
        else {
            $('#link').removeAttr('required');
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
            $('#title').removeAttr('required');
            $('#link').removeAttr('required');
            $('#AddNewState').removeAttr('required');
            $('#newNew').modal('hide');

            var title = self.title();
            var link = self.link();
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

            $.ajax({
                type: 'Post',
                url: '/News/SaveNew',
                data: ko.toJSON({ criteria: criteria, title: title, link: link }),
                async: false,
                dataType: "json",
                contentType: "application/json; charset=utf-8",
                success: function (data) {
                    self.showAlertMessage('Noticia creada correctamente');
                    self.news.push(new NewItem(data));
                    self.resetNewNew();
                },
                error: function (xhr, ajaxOptions, thrownError) {
                    alert('error');
                }
            });
        }
    };
    self.saveEditNew = function () {
        var error = false;
        if (self.link() == undefined || self.link().trim() == '') {
            $('#link').attr('required', 'required');
            error = true;
        }
        else {
            $('#link').removeAttr('required');
        }

        if (self.title() == undefined || self.title().trim() == '') {
            $('#title').attr('required', 'required');
            error = true;
        }
        else {
            $('#title').removeAttr('required');
        }

        if (error) {
            //alert('Hay campos requeridos');
        }
        else {
            $('#title').removeAttr('required');
            $('#link').removeAttr('required');
            $('#newNew').modal('hide');


            var idNoticia = self.selectedNew().IdNoticia();
            var title = self.title();
            var link = self.link();
            $.ajax({
                type: 'Post',
                url: '/News/UpdateNew',
                data: ko.toJSON({ idNoticia: idNoticia, title: title, link: link }),
                async: false,
                dataType: "json",
                contentType: "application/json; charset=utf-8",
                success: function (data) {
                    self.showAlertMessage('Noticia actualizada correctamente');
                    self.selectedNew().Titulo(title);
                    self.selectedNew().Link(link);
                    self.resetNewNew();
                },
                error: function (xhr, ajaxOptions, thrownError) {
                    alert('error');
                }
            });
        }
    };
    self.resetNewNew = function () {
        self.title('');
        self.link('');
        self.addEditReset();
        self.selectedNew(undefined);
    };
    self.initValuesNewNew = function () {
        self.getAddEditStates();
        self.addEditInitFilter();
        self.selectedNew(undefined);
    };
    self.initValuesEditNew = function (data) {
        self.selectedNew(data);
        self.title(data.Titulo());
        self.link(data.Link());
    };

    self.confirmDeleteNew = function (e) {
        swal({
            title: '¿Desea eliminar la noticia?',
            text: '¡Se perderá toda la información almacenada!',
            icon: 'warning',
            buttons: {
                cancel: true,
                confirm: {
                    text: 'Si',
                    value: true,
                    visible: true,
                    className: "bg-danger",
                    closeModal: true
                }
            }
        }).then(function (isConfirm) {
            if (isConfirm) {
                self.deleteNew(e);
            }
        });
    };
    self.deleteNew = function (data) {
        var noticiaId = data.IdNoticia();
        $.ajax({
            type: 'POST',
            url: '/News/DeleteNew',
            data: ko.toJSON({ idNoticia: noticiaId }),
            async: false,
            dataType: "json",
            contentType: "application/json; charset=utf-8",
            success: function (d) {
                if (d) {
                    self.showAlertMessage('Noticia eliminada correctamente');
                    //self.news.remove(data);
                    self.getData();
                }
            },
            error: function (xhr, ajaxOptions, thrownError) {

            }
        });
    };
    self.confirmChangeStatusNew = function (e) {
        swal({
            title: e.Activo() ? '¿Desea desactivar la noticia?' : '¿Desea activar la noticia?',
            text: e.Activo() ? '¡La encuesta ya no podrá ser vista!' : '¡La encuesta podrá ser vista!',
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
                self.newChangeStatus(e);
            }
        });
    };
    self.newChangeStatus = function (data) {
        var noticiaId = data.IdNoticia();
        $.ajax({
            type: 'POST',
            url: '/News/ChangeStatusNew',
            data: ko.toJSON({ idNoticia: noticiaId }),
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
    //INIT: NOTICIAS

    self.showAlertMessage = function (message) {
        swal(message, "", "success");
    };

    self.getStates();

}

$(function () {
    var model = new ViewModel();
    ko.applyBindings(model);
});