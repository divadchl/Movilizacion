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

function PersonItem(data) {
    var self = this;
    self.Nombre = ko.observable(data.Nombre + ' ' + data.Paterno + ' ' + data.Materno);
    self.Estado = ko.observable(data.Estado);
    self.Municipio = ko.observable(data.Municipio);
    self.INE = ko.observable(data.INE);
    self.DistritoFederal = ko.observable(data.DistritoFederal);
    self.DistritoLocal = ko.observable(data.DistritoLocal);
    self.Seccion = ko.observable(data.Seccion);
    self.Latitud = ko.observable(data.Latitud);
    self.Longitud = ko.observable(data.Longitud);
    self.IdPersona = ko.observable(data.IdPersona);


    self.Estatus = ko.observable(data.Estatus);
    self.EstatusColor = ko.observable('badge badge-light');
    if (data.Color == 'Azul') {
        self.EstatusColor('badge badge-light');
    }
    else if (data.Color == 'Rojo') {
        self.EstatusColor('badge badge-danger');
    }
    else if (data.Color == 'Verde') {
        self.EstatusColor('badge badge-success');
    }

    self.VigenteMessage = ko.observable('Sin validar');
    self.VigenteColor = ko.observable('badge badge-light');
    if (data.Vigente != null) {
        if (data.Vigente) {
            self.VigenteColor('badge badge-success');
            self.VigenteMessage('Válida');
        }
        else if (!data.Vigente) {
            self.VigenteColor('badge badge-danger');
            self.VigenteMessage('Inválida');
        }
    }

}

function SelectedPerson(data) {
    self.Name = ko.observable(data.NombreCompleto);
    self.CredentialFrontPhoto = ko.observable(data.CredencialFrente);
    self.CredentialBackPhoto = ko.observable(data.CredencialAtras);
    self.Email = ko.observable(data.Correo);
    self.Telephone = ko.observable(data.Telefono);
    self.Address = ko.observableArray(data.Domicilios);
    self.Guests = ko.observableArray(data.Invitados);
}

function FilterModel() {
    var self = this, map, marker, infoWindow, lat, lng, geocoder = new window.google.maps.Geocoder(), dragstart, dragend;

    self.currentPerson = ko.observable();
    self.divPrincipalVisible = ko.observable(true);
    self.divCurrentPersonVisible = ko.observable(false);
    self.selectedPerson = ko.observable(undefined);

    self.credentialTypeList = ko.observableArray([]);
    self.credentialTypeList.push({ Identifier: 1, Type: 'Credencial tipo C' });
    self.credentialTypeList.push({ Identifier: 2, Type: 'Credencial tipo DEF' });
    self.credentialTypeList.push({ Identifier: 3, Type: 'Credencial tipo GH' });
    self.selectedCredentialType = ko.observable();
    self.CredentialFrontPhotoLoadBase64 = ko.observable(undefined);
    self.CredentialBackPhotoLoadBase64 = ko.observable(undefined);

    self.selectedCredentialType.subscribe(function () {
        if (self.selectedCredentialType() == 1) {
            $("#exampleIneFront").attr("src", "/Content/Images/INE/TipoC_Front.jpg");
            $("#exampleIneBack").attr("src", "/Content/Images/INE/TipoC_Back.jpg");
        }
        if (self.selectedCredentialType() == 2) {
            $("#exampleIneFront").attr("src", "/Content/Images/INE/TipoDEF_Front.jpg");
            $("#exampleIneBack").attr("src", "/Content/Images/INE/TipoDEF_Back.jpg");
        }
        if (self.selectedCredentialType() == 3) {
            $("#exampleIneFront").attr("src", "/Content/Images/INE/TipoGH_Front.jpg");
            $("#exampleIneBack").attr("src", "/Content/Images/INE/TipoGH_Back.jpg");
        }
    });

    //***** Inicio Alta persona
    self.ApellidoMaterno = ko.observable('');
    self.ApellidoPaterno = ko.observable('');
    self.AñoRegistro = ko.observable('');
    self.CIC = ko.observable('');
    self.CP = ko.observable('');
    self.CURP = ko.observable('');
    self.Calle = ko.observable('');
    self.ClaveElector = ko.observable('');
    self.Colonia = ko.observable('');
    self.Emision = ko.observable('');
    self.Estado = ko.observable('');
    self.Localidad = ko.observable('');
    self.Municipio = ko.observable('');
    self.NoEstado = ko.observable('');
    self.NoMunicipio = ko.observable('');
    self.Nombre = ko.observable('');
    self.NumEmision = ko.observable('');
    self.Seccion = ko.observable('');
    self.Vigencia = ko.observable('');
    self.ZonaLecturaMecanica = ko.observable('');
    // Fin Alta persona

    self.setFrontIne = function () {
        var file = $('#IneFront')[0].files[0];
        if (file != undefined) {
            var reader = new FileReader();
            reader.onload = function (e) {
                self.CredentialFrontPhotoLoadBase64(reader.result);
                $("#selectedIneFront").attr("src", self.CredentialFrontPhotoLoadBase64());
                //var arrayBuffer = reader.result
                //var bytes = new Uint8Array(arrayBuffer);
                //self.CredentialFrontPhotoLoad(bytes);
            }
            //reader.readAsArrayBuffer(file);
            reader.readAsDataURL(file);
        }
    };

    self.setBackIne = function () {
        var file = $('#IneBack')[0].files[0];
        if (file != undefined) {
            var reader = new FileReader();
            reader.onload = function (e) {
                self.CredentialBackPhotoLoadBase64(reader.result);
                $("#selectedIneBack").attr("src", self.CredentialBackPhotoLoadBase64());
                //var arrayBuffer = reader.result
                //var bytes = new Uint8Array(arrayBuffer);
                //self.CredentialBackPhotoLoad(bytes);
            }
            //reader.readAsArrayBuffer(file);
            reader.readAsDataURL(file);
        }
    };

    self.LoadIneInformation = function () {
        if (self.CredentialFrontPhotoLoadBase64() != undefined && self.CredentialBackPhotoLoadBase64() != undefined) {

            $('body').addClass('waiting');

            $.ajax({
                type: 'POST',
                url: '/Deteccion/LoadIneInformation',
                data: ko.toJSON({ type: self.selectedCredentialType(), ineFront: self.CredentialFrontPhotoLoadBase64(), ineBack: self.CredentialBackPhotoLoadBase64() }),
                async: true,
                dataType: "json",
                contentType: "application/json; charset=utf-8",
                success: function (data) {
                    if (data.Item2 == '') {
                        self.ApellidoMaterno(data.Item1.ApellidoMaterno);
                        self.ApellidoPaterno(data.Item1.ApellidoPaterno);
                        self.AñoRegistro(data.Item1.AñoRegistro);
                        self.CIC(data.Item1.CIC);
                        self.CP(data.Item1.CP);
                        self.CURP(data.Item1.CURP);
                        self.Calle(data.Item1.Calle);
                        self.ClaveElector(data.Item1.ClaveElector);
                        self.Colonia(data.Item1.Colonia);
                        self.Emision(data.Item1.Emision);
                        self.Estado(data.Item1.Estado);
                        self.Localidad(data.Item1.Localidad);
                        self.Municipio(data.Item1.Municipio);
                        self.NoEstado(data.Item1.NoEstado);
                        self.NoMunicipio(data.Item1.NoMunicipio);
                        self.Nombre(data.Item1.Nombre);
                        self.NumEmision(data.Item1.NumEmision);
                        self.Seccion(data.Item1.Seccion);
                        self.Vigencia(data.Item1.Vigencia);
                        self.ZonaLecturaMecanica(data.Item1.ZonaLecturaMecanica);
                    }
                    else {
                        alert(data.Item2);
                    }
                    $('body').removeClass('waiting');
                },
                error: function (xhr, ajaxOptions, thrownError) {
                    $('body').removeClass('waiting');
                }
            });


        }
    };

    self.clearNewPerson = function () {
        self.ApellidoMaterno('');
        self.ApellidoPaterno('');
        self.AñoRegistro('');
        self.CIC('');
        self.CP('');
        self.CURP('');
        self.Calle('');
        self.ClaveElector('');
        self.Colonia('');
        self.Emision('');
        self.Estado('');
        self.Localidad('');
        self.Municipio('');
        self.NoEstado('');
        self.NoMunicipio('');
        self.Nombre('');
        self.NumEmision('');
        self.Seccion('');
        self.Vigencia('');
        self.ZonaLecturaMecanica('');
        self.CredentialBackPhotoLoadBase64(undefined);
        self.CredentialFrontPhotoLoadBase64(undefined);
        $("#selectedIneFront").attr("src", '');
        $("#selectedIneBack").attr("src", '');


        $('#IneFront').val('');
        $('#IneBack').val('');
        $('#IneFront').val(null);
        $('#IneBack').val(null);
        self.IsExpandedExample(true);
        self.IsExpandedSelected(true);
        //$("#collapseExample").attr("data-toggle", "collapse");


        //$("#collapseSelected").attr("data-toggle", "collapse");
    };

    self.personChanges = function () {
        if (self.selectedPerson() == undefined) {
            self.confirmNewPerson();
        }
        else {
            self.saveEditPerson();//No existe actualmente
        }
    };

    self.IsExpandedExample = ko.observable(true);
    self.ExpandCollapseExample = function () {
        if (self.IsExpandedExample()) {
            self.IsExpandedExample(false);
        }
        else {
            self.IsExpandedExample(true);
        }
    };

    self.IsExpandedSelected = ko.observable(true);
    self.ExpandCollapseSelected = function () {
        if (self.IsExpandedSelected()) {
            self.IsExpandedSelected(false);
        }
        else {
            self.IsExpandedSelected(true);
        }
    };

    self.ExistsIneRegister = function (ine) {

        var exists = false;

        $.ajax({
            type: 'Post',
            url: '/Deteccion/ExistsIneRegister',
            data: ko.toJSON({ ine: ine }),
            async: false,
            dataType: "json",
            contentType: "application/json; charset=utf-8",
            success: function (data) {
                exists = data;
            },
            error: function (xhr, ajaxOptions, thrownError) {
                alert('error');
            }
        });

        return exists;

    }

    self.confirmNewPerson = function () {
        swal({
            title: '¿Guardar la persona?',
            text: '¡Ya no podrá editar la información!',
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

                if (self.ClaveElector() == '') {
                    alert('Debe establecer datos válidos de INE');
                    return;
                }

                var existsIne = self.ExistsIneRegister(self.ClaveElector());
                if (existsIne) {
                    alert('El INE proporcionado ya se encuentra registrado');
                    return;
                }

                self.saveNewPerson();
                $('#newPerson').modal('hide');
            }
        });
    };

    self.saveNewPerson = function () {

        var person = {
            ApellidoMaterno: self.ApellidoMaterno(),
            ApellidoPaterno: self.ApellidoPaterno(),
            AñoRegistro: self.AñoRegistro(),
            CIC: self.CIC(),
            CP: self.CP(),
            CURP: self.CURP(),
            Calle: self.Calle(),
            ClaveElector: self.ClaveElector(),
            Colonia: self.Colonia(),
            Emision: self.Emision(),
            Estado: self.Estado(),
            Localidad: self.Localidad(),
            Municipio: self.Municipio(),
            NoEstado: self.NoEstado(),
            NoMunicipio: self.NoMunicipio(),
            Nombre: self.Nombre(),
            NumEmision: self.NumEmision(),
            Seccion: self.Seccion(),
            Vigencia: self.Vigencia(),
            ZonaLecturaMecanica: self.ZonaLecturaMecanica(),
            IneFront: self.CredentialFrontPhotoLoadBase64(),
            IneBack: self.CredentialBackPhotoLoadBase64(),
            IneType: self.selectedCredentialType()
        };

        $.ajax({
            type: 'POST',
            url: '/Deteccion/SaveNewPerson',
            data: ko.toJSON({ person: person }),
            async: false,
            dataType: "json",
            contentType: "application/json; charset=utf-8",
            success: function (data) {
                if (data) {
                    self.showAlertMessage('Persona almacenada correctamente');
                    self.search();
                    self.clearNewPerson();
                }
                else {
                    alert('No se pudo almacenar la persona.');
                }
            },
            error: function (xhr, ajaxOptions, thrownError) {
                alert('Error al intentar almacenar la persona.');
            }
        });


    };

    self.Name = ko.observable();
    self.CredentialFrontPhoto = ko.observable();
    self.CredentialBackPhoto = ko.observable();
    self.Email = ko.observable();
    self.Telephone = ko.observable();
    self.Address = ko.observableArray();
    self.Domicilio2 = ko.observable();
    self.Guests = ko.observableArray();
    var table = null;

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
        self.persons([]);
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
            self.persons([]);
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




    self.hideDetailPerson = function () {
        self.divPrincipalVisible(true);
        self.divCurrentPersonVisible(false);
    };

    self.consult = function (data) {
        var personId = data.IdPersona();

        $.ajax({
            type: 'GET',
            url: '/Deteccion/GetContact',
            data: { personId: personId },
            async: false,
            dataType: "json",
            contentType: "application/json; charset=utf-8",
            success: function (data) {
                self.Name(data.NombreCompleto);
                self.CredentialFrontPhoto(data.CredencialFrente);
                self.CredentialBackPhoto(data.CredencialAtras);
                self.Email(data.Correo);
                self.Telephone(data.Telefono);
                self.Address(data.Domicilios);
                self.Guests(data.Invitados);
                self.divPrincipalVisible(false);
                self.divCurrentPersonVisible(true);
            },
            error: function (xhr, ajaxOptions, thrownError) {

            }
        });

        if (self.CredentialFrontPhoto() != '') {
            $("#frontCredential").attr("src", "data:image/png;base64," + self.CredentialFrontPhoto());
        }
        if (self.CredentialBackPhoto() != '') {
            $("#backCredential").attr("src", "data:image/png;base64," + self.CredentialBackPhoto());
        }

        var locations = [];
        $.each(self.Address(), function (i, item) {
            locations.push({
                Latitud: item.Latitud,
                Longitud: item.Longitud
            });
        });
        self.initMultipleMap(locations, 'locateMapSecondary');
    };

    self.showPopPhoto = function (selected) {
        if (selected == 1) {
            if (self.CredentialFrontPhoto() != '') {
                $("#photoIne").attr("src", "data:image/png;base64," + self.CredentialFrontPhoto());
            }
        }
        else if (selected == 2) {
            if (self.CredentialBackPhoto() != '') {
                $("#photoIne").attr("src", "data:image/png;base64," + self.CredentialBackPhoto());
            }
        }
    };


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
            url: '/Deteccion/PersonList',
            data: ko.toJSON({ criteria: self.criteria() }),
            async: false,
            dataType: "json",
            contentType: "application/json; charset=utf-8",
            success: function (data) {
                self.persons([]);
                $.each(data, function (i, el) {
                    self.persons.push(new PersonItem(el));
                });
            },
            error: function (xhr, ajaxOptions, thrownError) {
                alert('error');
            }
        });

        self.initTable();
    };

    self.locate = function (data) {
        var lat = data.Latitud();
        var lng = data.Longitud();
        if (lat == 0 && lng == 0) {
            alert('No disponible para esta persona');
            return;
        }
        self.initIndividualMap(lat, lng, 'locateMap');
    };

    self.initTable = function () {
        table = $('#personTable').DataTable({
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

    self.initMultipleMap = function (locations, controlName) {

        map = new google.maps.Map(document.getElementById(controlName), {
            zoom: 16,
            center: new google.maps.LatLng(locations[0].Latitud, locations[0].Longitud),
            mapTypeId: google.maps.MapTypeId.ROADMAP
        });

        for (var i = 0; i < locations.length; i++) {
            var lat = locations[i].Latitud;
            var lng = locations[i].Longitud;
            marker = new google.maps.Marker({
                position: new google.maps.LatLng(lat, lng),
                map: map,
                icon: 'http://maps.google.com/mapfiles/ms/icons/'+ (i == 0 ? 'blue' : 'green') +'-dot.png'
            });
            google.maps.event.addListener(marker, 'click', function () {
                window.open('https://www.google.com/maps/search/?api=1&query=' + lat + ',' + lng);
            });
        }

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

    self.initValuesNewPerson = function () {
        //self.selectedPerson(undefined); //Cuando haya editar
    };

    self.showAlertMessage = function (message) {
        swal(message, "", "success");
    };


    self.getStates();
    self.initFilter();
}

$(function () {
    var model = new FilterModel();
    ko.applyBindings(model);
});