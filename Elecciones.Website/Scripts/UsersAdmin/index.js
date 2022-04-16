var model;

function Model() {
    self = this;
    self.perfilOptions = ko.observableArray();
    self.selectedPerfil = ko.observable();
    self.userTerritorios = ko.observableArray();
    self.selfTerritorios = ko.observableArray();
    self.selectedTerritorio = ko.observable();

    self.userProcesos = ko.observableArray();
    self.selfProcesos = ko.observableArray();
    self.selectedProceso = ko.observable();
    self.lastUser;

    self.getPerfilOptions = function (callback) {
        self.perfilOptions([]);
        $.ajax({
            type: 'GET',
            url: '/UsersAdmin/GetPerfiles',
            async: true,
            success: function (data) {
                //data.unshift({ Id: null, LongName: "CUALQUIERA" });
                self.perfilOptions(data);
                callback();
            },
            error: function (xhr, ajaxOptions, thrownError) {
            }
        });
    }

    self.buscar = function () {
        self.datatable.ajax.reload();
    }

    self.init = function () {
        self.getPerfilOptions(self.initTable);
    }

    self.initTable = function () {
        var columns = [
            {
                title: 'Usuario', data: null,
                render: function (data) {
                    var control = '';
                    if (data.LockedOut) {
                        control += '<span class="fa fa-ban"></span>'
                    }
                    control += '<span> ' + data.UserName + ' </span>';
                    return control;
                }
            },
            { title: 'Nombre', data: "NombreCompleto" },
            {
                title: 'Correo Electrónico', data: null, render: function (data) {
                    if (data.Email != undefined)
                        return '<span>' + Helper.dataShortener(data.Email, 20) + '</span>'
                    else
                        return '<a href="#" onclick=" model.openPopupWindow( \'/Usuarios/Assign?id=' + data.Id + '\'); return false;" > [Asignar]</a>'

                }
            },
            {
                title: 'Estados', data: 'Estados', orderable: false,
                render: function (data) {
                    if (data.length == 0) {
                        return '<div style="background-color: #f2dede;"><span class="glyphicon glyphicon-alert"> </span> [SIN CONFIGURAR]</div>';
                    }
                    else {
                        return '<span>' + Helper.dataShortener(data.join(','), 15) + '</span>';
                    }
                }
            },
            {
                title: 'Procesos', data: 'Procesos', orderable: false,
                render: function (data) {
                    if (data.length == 0) {
                        return '<div style="background-color: #f2dede;"><span class="glyphicon glyphicon-alert"> </span> [SIN CONFIGURAR]</div>';
                    }
                    else {
                        return '<span>' + Helper.dataShortener(data.join(','), 15) + '</span>';
                    }
                }
            }];
        columns.push(
            {
                title: 'Acciones', orderable: false,
                data: null, render: function (data, type, row, meta) {
                    var isAssigned = data.Email != undefined;
                    var control = '<div class="input-group"> <div class="input-group-prepend">  <a class="dropdown-toggle" data-toggle="dropdown" href="#" role="button"> <i class="align-middle mr-2 fas fa-fw fa-ellipsis-h"></i>  </a> <div class="dropdown-menu">';
                    if (isAssigned) {
                        control += '<a class="dropdown-item" href="#" onclick=" model.openPopupWindow( \'/Usuarios/Edit?id=' + data.Id + '\'); return false;" > <span class="fas fa-fw fa-edit" ></span> Editar </a>';
                        control += '<a class="dropdown-item" href="#" onclick=" model.openPopupWindow( \'/Usuarios/ResetPassword?id=' + data.Id + '\'); return false;" > <span class="fa fa-key" ></span> Restablecer contraseña</a>';
                        var lockedOutTitle = data.LockedOut ? "Activar" : "Desactivar";
                        control += '<a class="dropdown-item"  href="#" onclick=" model.openPopupWindow( \'/Usuarios/DisableUser?id=' + data.Id + '\'); return false;" > <span class="fa fa-unlock" ></span> ' + lockedOutTitle + ' usuario </a>';
                    }
                    control += '<a class="dropdown-item" href="#" onclick=" model.openTerritoriosModel( \'' + data.Id + '\'); return false;" > <span class="fas fa-fw fa-globe" ></span> Configurar estados </a>';
                    control += '<a class="dropdown-item" href="#" onclick=" model.openProcesosModel( \'' + data.Id + '\'); return false;" > <span class="fas fa-fw fa-project-diagram" ></span> Configurar procesos </a>';
                    control += '<a class="dropdown-item" href="#" onclick=" model.openPopupWindow( \'/Usuarios/Delete?id=' + data.Id + '\'); return false;" > <span class="fas fa-fw fa-trash" ></span> Eliminar usuario </a>';
                    control += '</div></div></div>';
                    return control;
                }
            });
        self.datatable = $('#usersTable').DataTable({
            processing: true,
            serverSide: true,
            ajax: {
                url: '/UsersAdmin/GetUsers',
                data: function (d) {
                    d.perfil = self.selectedPerfil();
                    d.searchDetail = d.search.value;
                    d.orderColumn = d.order[0].column;
                    d.orderDirection = d.order[0].dir;
                }
            },
            columns: columns,
            dom: 'Blfrtip',
            buttons: [],
            language: Helper.dataTablesLanguage
        });
    }

    self.loadUserTerritories = function (userId) {
        if (userId != undefined)
            self.lastUser = userId;
        self.userTerritorios([]);
        $.ajax({
            type: 'GET',
            url: '/UsersAdmin/GetEstadosById',
            data: { id: self.lastUser },
            async: true,
            success: function (data) {
                self.userTerritorios(data);
            },
            error: function (xhr, ajaxOptions, thrownError) {
            }
        });
    }

    self.loadSelfTerritories = function () {
        $.ajax({
            type: 'GET',
            url: '/Territorios/GetEstadosForUser',
            async: true,
            success: function (data) {
                self.selfTerritorios(data);
            },
            error: function (xhr, ajaxOptions, thrownError) {
            }
        });
    }

    self.openTerritoriosModel = function (userId) {
        self.loadUserTerritories(userId);
        $("#territoriosModal").modal("show");
    }

    self.newTerritory = function () {
        self.loadSelfTerritories();
        $("#newTerritorioModal").modal("show");
    }

    self.saveTerritory = function () {
        $.ajax({
            type: 'POST',
            url: '/UsersAdmin/SaveTerritorio',
            data: {
                userId: self.lastUser,
                id: self.selectedTerritorio()
            },
            async: true,
            success: function (data) {
                if (data) {
                    self.loadUserTerritories();
                    model.datatable.ajax.reload(null, false);
                }
            },
            error: function (xhr, ajaxOptions, thrownError) {
            }
        });
        $("#newTerritorioModal").modal("hide");
    }

    self.deleteTerritory = function (data) {
        if (confirm("Está seguro que desea eliminar el territorio " + data.Name)) {
            $.ajax({
                type: 'POST',
                url: '/UsersAdmin/DeleteTerritory',
                data: { id: data.TerritorioId },
                async: false,
                success: function (data) {
                    if (data) {
                        self.loadUserTerritories();
                        model.datatable.ajax.reload(null, false);
                    }
                },
                error: function (xhr, ajaxOptions, thrownError) {
                }
            });
        }
    }

    self.loadUserProcesos = function (userId) {
        if (userId != undefined)
            self.lastUser = userId;
        self.userProcesos([]);
        $.ajax({
            type: 'GET',
            url: '/UsersAdmin/GetProcesosById',
            data: { id: self.lastUser },
            async: true,
            success: function (data) {
                self.userProcesos(data);
            },
            error: function (xhr, ajaxOptions, thrownError) {
            }
        });
    }

    self.loadSelfProcesos = function () {
        $.ajax({
            type: 'GET',
            url: '/Territorios/GetProcesosForUser',
            async: true,
            success: function (data) {
                self.selfProcesos(data);
            },
            error: function (xhr, ajaxOptions, thrownError) {
            }
        });
    }

    self.openProcesosModel = function (userId) {
        self.loadUserProcesos(userId);
        $("#procesosModal").modal("show");
    }

    self.newProceso = function () {
        self.loadSelfProcesos();
        $("#newProcesoModal").modal("show");
    }

    self.saveProceso = function () {
        $.ajax({
            type: 'POST',
            url: '/UsersAdmin/SaveProceso',
            data: {
                userId: self.lastUser,
                id: self.selectedProceso()
            },
            async: true,
            success: function (data) {
                if (data) {
                    self.loadUserProcesos();
                    model.datatable.ajax.reload(null, false);
                }
            },
            error: function (xhr, ajaxOptions, thrownError) {
            }
        });
        $("#newProcesoModal").modal("hide");
    }

    self.deleteProceso = function (data) {
        if (confirm("Está seguro que desea eliminar el proceso " + data.Name)) {
            $.ajax({
                type: 'POST',
                url: '/UsersAdmin/DeleteProceso',
                data: { id: data.ProcesoId },
                async: false,
                success: function (data) {
                    if (data) {
                        self.loadUserProcesos();
                        model.datatable.ajax.reload(null, false);
                    }
                },
                error: function (xhr, ajaxOptions, thrownError) {
                }
            });
        }
    }

    self.openPopupWindow = function (url) {
        if (self.popUpWindow != undefined)
            self.popUpWindow = undefined;

        self.popUpWindow = window.open(url, "popup_window", 'width=' + screen.width + ',height=' + screen.height + ',fullscreen=0,toolbar=0,location=0,menubar=0,location=0,status=0,scrollbars=1,resizable=1,left=0,top=0');
    }
}

$(function () {
    model = new Model();
    model.init();
    ko.applyBindings(model);
});

function popupwindowCallback(reload) {
    model.popUpWindow.close();
    if (reload)
        model.datatable.ajax.reload(null, false);
}