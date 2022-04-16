var model;

function Model() {
    self = this;
    self.stateList = ko.observableArray([]);
    self.selectedState = ko.observable();
    self.municipalityList = ko.observableArray([]);
    self.selectedMunicipality = ko.observable();
    self.localDistrictList = ko.observableArray([]);
    self.selectedLocalDistrict = ko.observable();
    self.federalDistrictList = ko.observableArray([]);
    self.selectedFederalDistrict = ko.observable();
    self.sectionList = ko.observableArray([]);
    self.selectedSection = ko.observable();
    self.tableBoxes = ko.observable([]);
    self.state = ko.observable();
    self.visibleFilter = ko.observable();
    let objectFilterState;
    let objectFilterMunicipality;
    let objectFilterFederalDistrict;
    let objectFilterLocalDistrict;
    let objectFilterSection;
    let filterStack = [objectFilterState, objectFilterMunicipality, objectFilterFederalDistrict, objectFilterLocalDistrict, objectFilterSection];

    self.selectedState.subscribe((value) => {
        if (value != undefined) {
            objectFilterState = {
                Activo: false,
                Descripcion: '',
                Firma: '',
                Id: value,
                TipoTerritorio: 'Estado'
            };
            self.visibleFilter(true);
            filterStack[0] = objectFilterState;
            self.State = value;
            self.getBoxes();
            self.getMunicipalities();
            self.getFederalDistrict();
            self.getLocalDistrict();
            self.getSection();
        } else {
            self.getBoxes([]);
            self.visibleFilter(false);
        }
    })

    self.selectedMunicipality.subscribe((value) => {
        if (value != undefined) {
            objectFilterMunicipality = {
                Activo: false,
                Descripcion: '',
                Firma: '',
                Id: value,
                TipoTerritorio: 'Municipio'
            };
            filterStack[1] = objectFilterMunicipality;
            self.getBoxes();
            self.getFederalDistrict();
            self.getSection();
        } else {
            filterStack[1] = null;
            self.getBoxes();
            self.getFederalDistrict();
            self.getSection();
        }
    })

    self.selectedFederalDistrict.subscribe(function (value) {
        if (value != undefined) {
            objectFilterFederalDistrict = {
                Activo: false,
                Descripcion: '',
                Firma: '',
                Id: value,
                TipoTerritorio: 'DistritoFederal'
            };
            filterStack[2] = objectFilterFederalDistrict;
            self.getBoxes();
            self.getMunicipalities();
            self.getSection();
        } else {
            filterStack[2] = null;
            self.getBoxes();
            self.getMunicipalities();
            self.getSection();
        }
    })

    self.selectedLocalDistrict.subscribe(function (value) {
        if (value != undefined) {
            objectFilterLocalDistrict = {
                Activo: false,
                Descripcion: '',
                Firma: '',
                Id: value,
                TipoTerritorio: 'DistritoLocal'
            };
            filterStack[3] = objectFilterLocalDistrict;
            self.getBoxes();
            self.getMunicipalities();
            self.getSection();
        } else {
            filterStack[3] = null;
            self.getBoxes();
            self.getMunicipalities();
            self.getSection();
        }
    })

    self.selectedSection.subscribe(function (value) {
        if (value != undefined) {
            objectFilterSection = {
                Activo: false,
                Descripcion: '',
                Firma: '',
                Id: value,
                TipoTerritorio: 'Seccion'
            };
            filterStack[4] = objectFilterSection;
            self.getBoxes();
            self.getMunicipalities();
            self.getFederalDistrict();
            self.getLocalDistrict();
        } else {
            filterStack[4] = null;
            self.getBoxes();
            self.getMunicipalities();
            self.getFederalDistrict();
            self.getLocalDistrict();
        }
    })

    self.getStates = function () {
        $("#states").prop("disabled", true);
        $.ajax({
            type: 'GET',
            url: '/Territory/GetStates',
            async: true,
            dataType: "json",
            contentType: "application/json; charset=utf-8",
            success: function (data) {
                self.stateList(data);
                $("#states").prop("disabled", false);
                //if (callback)
                //    callback();
                //if (data.length == 1) {
                //    self.selectedState(self.stateList()[0].Identifier);
                //}
            },
            error: function (xhr, ajaxOptions, thrownError) {
                $("#states").prop("disabled", false);
            }
        });
    };

    self.getMunicipalities = function () {
        let objectsFilter = filterStack.filter(filtro => filtro != null);
        let stack = JSON.stringify(objectsFilter);
        $("#municipalities").prop("disabled", true);
        $.ajax({
            type: 'POST',
            url: '/Territory/StackTerritory',
            data: { stack: stack, tipo: 2 },
            async: false,
            success: function (data) {
                self.municipalityList(data.Lista);
                $("#municipalities").prop("disabled", false);
                
            },
            error: function (xhr, ajaxOptions, thrownError) {
                alert(xhr.status);
                alert(thrownError);
            }
        });
    };

    self.getFederalDistrict = function () {
        let objectsFilter = filterStack.filter(filtro => filtro != null);
        let stack = JSON.stringify(objectsFilter);
        $("#federaldistrict").prop("disabled", true);
        $.ajax({
            type: 'POST',
            url: '/Territory/StackTerritory',
            data: { stack: stack, tipo: 3 },
            async: false,
            success: function (data) {
                self.federalDistrictList(data.Lista);
                $("#federaldistrict").prop("disabled", false);
            },
            error: function (xhr, ajaxOptions, thrownError) {
                alert(xhr.status);
                alert(thrownError);
            }
        });
    };

    self.getLocalDistrict = function () {
        let objectsFilter = filterStack.filter(filtro => filtro != null);
        let stack = JSON.stringify(objectsFilter);
        $("#localdistrict").prop("disabled", true);
        $.ajax({
            type: 'POST',
            url: '/Territory/StackTerritory',
            data: { stack: stack, tipo: 4 },
            async: false,
            success: function (data) {
                self.localDistrictList(data.Lista);
                $("#localdistrict").prop("disabled", false);
            },
            error: function (xhr, ajaxOptions, thrownError) {
                alert(xhr.status);
                alert(thrownError);
            }
        });
    };

    self.getSection = function () {
        let objectsFilter = filterStack.filter(filtro => filtro != null);
        let stack = JSON.stringify(objectsFilter);
        $("#section").prop("disabled", true);
        $.ajax({
            type: 'POST',
            url: '/Territory/StackTerritory',
            data: { stack: stack, tipo: 5 },
            async: false,
            success: function (data) {

                self.sectionList(data.Lista);
                $("#section").prop("disabled", false);
            },
            error: function (xhr, ajaxOptions, thrownError) {
                alert(xhr.status);
                alert(thrownError);
            }
        });
    };

    self.getBoxes = function () {
        self.tableBoxes = $('#Boxes').DataTable({
            processing: true,
            serverSide: true,
            destroy: true,
            //responsive: true,
            searchDelay: 1000,
            ajax: {
                url: "/Deteccion/GetBoxesList",
                data: function (d) {
                    d.searchDetail = d.search.value;
                    d.orderColumn = d.order[0].column;
                    d.orderDirection = d.order[0].dir;
                    d.state = self.selectedState;
                    d.municipality = self.selectedMunicipality;
                    d.federalDistrict = self.selectedFederalDistrict;
                    d.localDistrict = self.selectedLocalDistrict;
                    d.section = self.selectedSection;
                },
                type: "GET",
                //dataSrc: ""
            },
            columns: [
                { title: "Casilla", data: "Casilla" },
                { title: "Estado", data: "Estado" },
                { title: "Municipio", data: "Municipio" },
                { title: "Distrito Federal", data: "DistritoFederal" },
                { title: "Distrito Local", data: "DistritoLocal" },
                { title: "Seccion", data: "Seccion" },
                {
                    title: "Opciones", ordenable: false, data: null, "render": function (data) {
                        let control = '<button type="button" onClick="model.getBox(\''+ data.IdCasilla +'\');" class="btn btn-sm btn-success command-delete" data-bind="click: $root.locate" title="Ver detalle" data-toggle="modal" data-target="#mapModalLocate"><em class="fa fa-map-marked-alt fa-fw"></em></button>';
                        return control;
                    }
                }
            ],
            //language: Helper.dataTablesLanguage
        });

    }

    self.getBox = function(id){
        console.log(id)
    }

    self.reloadTables = function () {
        self.tableBoxes.ajax.reload(null, false);
    };

    self.init = function () {
        self.visibleFilter(false);
        self.getStates();
    }
}

$(function () {
    model = new Model();
    model.init();
    ko.applyBindings(model);
});
