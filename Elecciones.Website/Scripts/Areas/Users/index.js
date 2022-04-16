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

function UserItem(data) {
    var self = this;
    self.Id = ko.observable(data.Id);
    self.Nombre = ko.observable(data.Nombre);
    self.ApellidoPaterno = ko.observable(data.ApellidoPaterno);
    self.ApellidoMaterno = ko.observable(data.ApellidoMaterno);
    self.NombreCompleto = ko.observable(data.NombreCompleto);
    self.Correo = ko.observable(data.Correo);
    self.Telefono = ko.observable(data.Telefono);
    self.Username = ko.observable(data.Username);
    self.Perfil = ko.observable(data.Perfil);
}

function PerfilItem(data) {
    var self = this;
    self.Id = ko.observable(data.Id);
    self.Perfil = ko.observable(data.Name);
}

function FilterModel() {
    var self = this;
    var table = null;
    var territoryTable = null;

    self.divPrincipalVisible = ko.observable(true);
    self.divTerritoryVisible = ko.observable(false);
    self.generalInformation = ko.observable('');

    self.usuarios = ko.observableArray([]);
    self.selectedUser = ko.observable(undefined);
    self.perfiles = ko.observableArray([]);
    self.selectedPerfil = ko.observable(undefined);
    self.territoriosUsuario = ko.observableArray([]);

    self.userName = ko.observable('');
    self.name = ko.observable('');
    self.patern = ko.observable('');
    self.matern = ko.observable('');
    self.phone = ko.observable('');
    self.email = ko.observable('');
    self.perfil = ko.observable('');

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
                self.stateAddEditList([]);
                $.each(data, function (i, item) {
                    if (item.Identifier == window.currentStateId) {
                        self.stateAddEditList.push(item);
                    }
                });
                //self.stateAddEditList(data);
                if (self.stateAddEditList().length == 1) {
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
            { Id: 5, Description: 'Seccion', Field: "IdSeccion", IsTerritory: true, TerritoryType: 5, Territory: [], Dependant: 0, Error: false },
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

    self.getUsers = function () {
        if (table != null) {
            table.clear();
            table.destroy();
            table = null;
        }

        $.ajax({
            type: 'Post',
            url: '/Users/GetUsers',
            async: false,
            dataType: "json",
            contentType: "application/json; charset=utf-8",
            success: function (res) {
                self.usuarios([]);
                $.each(res, function (i, el) {
                    var user = new UserItem(el);
                    self.usuarios.push(user);
                });
            },
            error: function (xhr, ajaxOptions, thrownError) {
                alert('error');
            }
        });

        self.initTable();
    };

    self.initTable = function () {
        table = $('#usersByProcessTable').DataTable({
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

    self.getPerfiles = function () {
        $.ajax({
            type: 'Post',
            url: '/Users/GetGroups',
            async: false,
            dataType: "json",
            contentType: "application/json; charset=utf-8",
            success: function (data) {
                self.perfiles([]);
                $.each(data, function (i, el) {
                    self.perfiles.push(new PerfilItem(el));
                });
            },
            error: function (xhr, ajaxOptions, thrownError) {
                alert('error');
            }
        });
    };

    self.existsUser = function (username) {
        var existsUser = false;
        $.ajax({
            type: 'Post',
            url: '/Users/ExistsUser',
            data: ko.toJSON({ username: username }),
            async: false,
            dataType: "json",
            contentType: "application/json; charset=utf-8",
            success: function (data) {
                existsUser = data;
            },
            error: function (xhr, ajaxOptions, thrownError) {
                alert('error');
                existsUser = true;
            }
        });
        return existsUser;
    };

    self.initValuesNewUser = function () {
        self.selectedPerfil(undefined);
        self.selectedUser(undefined);

        self.userName('');
        self.name('');
        self.patern('');
        self.matern('');
        self.phone('');
        self.email('');
        self.getPerfiles();
    };

    self.newUser = function () {
        if (self.selectedUser() == undefined) {
            self.saveNewUser();
        }
        else {
            self.saveEditUser();
        }
    };

    self.saveNewUser = function () {
        var error = false;
        if (self.userName() == undefined || self.userName().trim() == '') {
            $('#username').attr('required', 'required');
            error = true;
        }
        else {
            var existUser = self.existsUser(self.userName());
            if (existUser) {
                $('#username').attr('required', 'required');
                error = true;
                alert('El nombre de usuario ya existe. Elija otro.');
                return;
            }
            else {
                $('#username').removeAttr('required');
            }
        }

        if (self.email() == undefined || self.email().trim() == '') {
            $('#email').attr('required', 'required');
            error = true;
        }
        else {
            if (!validateEmail(self.email())) {
                $('#email').attr('required', 'required');
                error = true;
                alert('El email es inválido.');
                return;
            }
            $('#email').removeAttr('required');
        }


        if (self.name() == undefined || self.name().trim() == '') {
            $('#name').attr('required', 'required');
            error = true;
        }
        else {
            $('#name').removeAttr('required');
        }

        if (self.patern() == undefined || self.patern().trim() == '') {
            $('#patern').attr('required', 'required');
            error = true;
        }
        else {
            $('#patern').removeAttr('required');
        }

        if (self.matern() == undefined || self.matern().trim() == '') {
            $('#matern').attr('required', 'required');
            error = true;
        }
        else {
            $('#matern').removeAttr('required');
        }

        if (self.phone() == undefined || self.phone().trim() == '') {
            $('#phone').attr('required', 'required');
            error = true;
        }
        else {
            $('#phone').removeAttr('required');
        }

        if (self.selectedPerfil() == undefined || self.selectedPerfil().trim() == '') {
            $('#perfiles').attr('required', 'required');
            error = true;
        }
        else {
            $('#perfiles').removeAttr('required');
        }

        if (error) {
            //alert('Hay campos requeridos');
        }
        else {
            $('#username').removeAttr('required');
            $('#email').removeAttr('required');
            $('#name').removeAttr('required');
            $('#patern').removeAttr('required');
            $('#matern').removeAttr('required');
            $('#phone').removeAttr('required');
            $('#perfiles').removeAttr('required');

            $('#newUser').modal('hide');

            var element = {
                UserName: self.userName(),
                Nombre: self.name(),
                Paterno: self.patern(),
                Materno: self.matern(),
                Email: self.email(),
                Telefono: self.phone()
            };
            var perfiles = [];
            perfiles.push(self.selectedPerfil());

            $.ajax({
                type: 'Post',
                url: '/Users/NewUser',
                data: ko.toJSON({ userViewModel: element, selectedGroups: perfiles }),
                async: false,
                dataType: "json",
                contentType: "application/json; charset=utf-8",
                success: function (data) {
                    self.showAlertMessage('Usuario creado correctamente');
                    self.getUsers();
                    self.initValuesNewUser();
                },
                error: function (xhr, ajaxOptions, thrownError) {
                    alert('error');
                }
            });
        }
    };

    self.editUser = function (data) {
        self.selectedUser(data);
        self.userName(data.Username());
        self.name(data.Nombre());
        self.patern(data.ApellidoPaterno());
        self.matern(data.ApellidoMaterno());
        self.phone(data.Telefono());
        self.email(data.Correo());
        self.perfil(data.Perfil());
    };

    self.saveEditUser = function () {
        var error = false;
        if (self.email() == undefined || self.email().trim() == '') {
            $('#email').attr('required', 'required');
            error = true;
        }
        else {
            if (!validateEmail(self.email())) {
                $('#email').attr('required', 'required');
                error = true;
                alert('El email es inválido.');
                return;
            }
            $('#email').removeAttr('required');
        }

        if (self.name() == undefined || self.name().trim() == '') {
            $('#name').attr('required', 'required');
            error = true;
        }
        else {
            $('#name').removeAttr('required');
        }

        if (self.patern() == undefined || self.patern().trim() == '') {
            $('#patern').attr('required', 'required');
            error = true;
        }
        else {
            $('#patern').removeAttr('required');
        }

        if (self.matern() == undefined || self.matern().trim() == '') {
            $('#matern').attr('required', 'required');
            error = true;
        }
        else {
            $('#matern').removeAttr('required');
        }

        if (self.phone() == undefined || self.phone().trim() == '') {
            $('#phone').attr('required', 'required');
            error = true;
        }
        else {
            $('#phone').removeAttr('required');
        }

        if (error) {
            //alert('Hay campos requeridos');
        }
        else {
            $('#email').removeAttr('required');
            $('#name').removeAttr('required');
            $('#patern').removeAttr('required');
            $('#matern').removeAttr('required');
            $('#phone').removeAttr('required');

            $('#newUser').modal('hide');

            var element = {
                Id: self.selectedUser().Id(),
                UserName: self.userName(),
                Nombre: self.name(),
                Paterno: self.patern(),
                Materno: self.matern(),
                Email: self.email(),
                Telefono: self.phone()
            };

            $.ajax({
                type: 'Post',
                url: '/Users/EditUser',
                data: ko.toJSON({ editUser: element }),
                async: false,
                dataType: "json",
                contentType: "application/json; charset=utf-8",
                success: function (data) {
                    self.showAlertMessage('Usuario actualizado correctamente');
                    self.getUsers();
                    self.initValuesNewUser();
                },
                error: function (xhr, ajaxOptions, thrownError) {
                    alert('error');
                }
            });
        }
    };

    self.confirmResetPassword = function (user) {
        swal({
            title: '¿Desea restablecer la contraseña del usuario ' + user.Username() + '?',
            text: '¡Se le enviará un correo con la nueva contraseña!',
            icon: 'info',
            buttons: {
                cancel: true,
                confirm: {
                    text: 'Si',
                    value: true,
                    visible: true,
                    className: "bg-info",
                    closeModal: true
                }
            }
        }).then(function (isConfirm) {
            if (isConfirm) {
                self.resetPassword(user);
            }
        });
    };

    self.resetPassword = function (user) {
        $.ajax({
            type: 'Post',
            url: '/Users/ResetPasswordUser',
            data: ko.toJSON({ id: user.Id() }),
            async: false,
            dataType: "json",
            contentType: "application/json; charset=utf-8",
            success: function (data) {
                self.showAlertMessage('Contraseña restablecida correctamente');
            },
            error: function (xhr, ajaxOptions, thrownError) {
                alert('error');
            }
        });
    };

    self.confirmDeleteUser = function (user) {
        swal({
            title: '¿Desea eliminar el usuario ' + user.Username() + '?',
            text: '¡El usuario dejará de existir!',
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
                self.deleteUser(user);
            }
        });
    };

    self.deleteUser = function (user) {
        $.ajax({
            type: 'Post',
            url: '/Users/DeleteUser',
            data: ko.toJSON({ id: user.Id() }),
            async: false,
            dataType: "json",
            contentType: "application/json; charset=utf-8",
            success: function (data) {
                self.showAlertMessage('Usuario eliminado correctamente');
                self.getUsers();
            },
            error: function (xhr, ajaxOptions, thrownError) {
                alert('error');
            }
        });
    };

    self.hideTerritoryForm = function () {
        self.divPrincipalVisible(true);
        self.divTerritoryVisible(false);
        if (territoryTable != null) {
            territoryTable.clear();
            territoryTable.destroy();
            territoryTable = null;
        }
    };

    self.showTerritories = function (user) {
        self.selectedUser(user);
        if (territoryTable != null) {
            territoryTable.clear();
            territoryTable.destroy();
            territoryTable = null;
        }
        var userId = user.Id();
        $.ajax({
            type: 'Post',
            url: '/Users/GetTerritorios',
            data: ko.toJSON({ id: userId }),
            async: false,
            dataType: "json",
            contentType: "application/json; charset=utf-8",
            success: function (data) {
                self.territoriosUsuario(data);
                self.divPrincipalVisible(false);
                self.divTerritoryVisible(true);
            },
            error: function (xhr, ajaxOptions, thrownError) {
                alert('error');
            }
        });

        self.initTerritoryTable();
    }

    self.initTerritoryTable = function () {
        territoryTable = $('#territoryTable').DataTable({
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

    self.addEditValidate = function () {
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

    self.initValuesNewTerritory = function () {
        self.getAddEditStates();
        self.addEditReset();
    };

    self.saveAddTerritory = function () {
        var responseValidate = self.addEditValidate();
        if (responseValidate) {
            return;
        }

        $('#newTerritory').modal('hide');
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
            url: '/Users/AddTerritorios',
            data: ko.toJSON({ userName: self.selectedUser().Username, criteria: criteria }),
            async: false,
            dataType: "json",
            contentType: "application/json; charset=utf-8",
            success: function (data) {
                self.showAlertMessage('Territorio agregado correctamente');
                self.showTerritories(self.selectedUser());
            },
            error: function (xhr, ajaxOptions, thrownError) {
                alert('error');
            }
        });

    };

    self.confirmDeleteTerritory = function (territory) {
        swal({
            title: '¿Desea eliminar el territorio?',
            text: '¡El territorio se desasignará al usuario!',
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
                self.deleteTerritory(territory);
            }
        });
    };

    self.deleteTerritory = function (territory) {
        $.ajax({
            type: 'Post',
            url: '/Users/DeleteTerritory',
            data: ko.toJSON({ username: self.selectedUser().Username(), territoryId: territory.IdTerritorio }),
            async: false,
            dataType: "json",
            contentType: "application/json; charset=utf-8",
            success: function (data) {
                self.showAlertMessage('Territorio eliminado correctamente');
                self.showTerritories(self.selectedUser());
            },
            error: function (xhr, ajaxOptions, thrownError) {
                alert('error');
            }
        });
    };




    self.showAlertMessage = function (message) {
        swal(message, "", "success");
    };

    $.ajax({
        type: 'Post',
        url: '/Users/GetGeneralInformation',
        async: false,
        dataType: "json",
        contentType: "application/json; charset=utf-8",
        success: function (data) {
            self.generalInformation(data);
        },
        error: function (xhr, ajaxOptions, thrownError) {
            alert('error');
        }
    });
}

$(function () {
    var model = new FilterModel();
    ko.applyBindings(model);

    model.getUsers();
});


function validateEmail(email) {
    var testEmail = /^[A-Z0-9._%+-]+@([A-Z0-9-]+\.)+[A-Z]{2,4}$/i;
    return testEmail.test(email);
}