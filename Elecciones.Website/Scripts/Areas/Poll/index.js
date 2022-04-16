
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

function AnswerItem(data) {
    var self = this;
    self.IdRespuesta = ko.observable(data.Identifier);
    self.IdPregunta = ko.observable(data.IdPregunta);
    self.Respuesta = ko.observable(data.Answer);
    self.Activo = ko.observable(data.Activo);
    self.CantidadParticipantes = ko.observable(data.CantidadParticipantes);
}

function QuestionItem(data) {
    var self = this;
    self.IsExpanded = ko.observable(false);

    self.IdPregunta = ko.observable(data.Identifier);
    self.Pregunta = ko.observable(data.Question);
    self.EsAbierta = ko.observable(data.IsOpen);
    self.EsMultiple = ko.observable(data.IsMultiple);
    self.EsIndividual = ko.observable(data.IsIndividual);
    self.CantidadParticipantes = ko.observable(data.CantidadParticipantes);
    self.Activo = ko.observable(data.Activo);
    self.Respuestas = ko.observableArray([]);
    self.OpenAnswers = ko.observableArray([]);
    if (data.AnswerList != undefined) {
        $.each(data.AnswerList, function (i, item) {
            var answer = new AnswerItem(item);
            self.Respuestas.push(answer);
        });
    }
    if (data.OpenAnswers != undefined) {
     $.each(data.OpenAnswers, function (i, item) {
            var sendItem = {
                Identifier : "0",
                IdPregunta: data.Question,
                Answer: item,
                Activo: true,
                CantidadParticipantes: 0
            };
            var answer = new AnswerItem(sendItem);
            self.OpenAnswers.push(answer);
       });
    }
}

function PollItem(data) {
    var self = this;
    self.IdEncuesta = ko.observable(data.Identifier);
    self.Nombre = ko.observable(data.Nombre);
    self.CantidadPreguntas = ko.observable(data.CantidadPreguntas);
    self.CantidadParticipantes = ko.observable(data.CantidadParticipantes);
    self.Vigencia = ko.observable(data.VigenciaStr);
    self.Preguntas = ko.observableArray([]);
    self.Activo = ko.observable(data.Activo);
    if (data.Preguntas != undefined) {
        $.each(data.Preguntas, function (i, item) {
            var question = new QuestionItem(item);
            self.Preguntas.push(question);
        });
    }
}

function ViewModel() {
    var self = this;
    var encuestaTable = null;
    var preguntaTable = null;
    self.divPrincipalVisible = ko.observable(true);
    self.divAddEditVisible = ko.observable(false);
    self.divDetailVisible = ko.observable(false);

    self.messageBotton = ko.observable('');

    self.encuestas = ko.observableArray([]);
    self.selectedPoll = ko.observable(undefined);
    self.selectedPollDetail = ko.observable(undefined);
    self.pollName = ko.observable();
    self.vigencia = ko.observable();

    self.questions = ko.observableArray([]);
    self.selectedQuestion = ko.observable(undefined);
    self.questionType = ko.observable('multiple');
    self.currentQuestion = ko.observable('');

    self.selectedAnswer = ko.observable(undefined);
    self.currentAnswer = ko.observable('');

    self.currentQuestionDetail = ko.observableArray();

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
        self.encuestas([]);
        if (encuestaTable != null) {
            encuestaTable.clear();
            encuestaTable.destroy();
            encuestaTable = null;
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
        if (encuestaTable != null) {
            encuestaTable.clear();
            encuestaTable.destroy();
            encuestaTable = null;
        }
    });
    self.allChecked.subscribe(function (value) {
        if (value) {
            self.reset();
            self.criteria([]);
            self.search();
        }
        else {
            self.encuestas([]);
            if (encuestaTable != null) {
                encuestaTable.clear();
                encuestaTable.destroy();
                encuestaTable = null;
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
        if (encuestaTable != null) {
            encuestaTable.clear();
            encuestaTable.destroy();
            encuestaTable = null;
        }

        $.ajax({
            type: 'Post',
            url: '/Poll/GetPollList',
            data: ko.toJSON({ criteria: self.criteria() }),
            async: false,
            dataType: "json",
            contentType: "application/json; charset=utf-8",
            success: function (data) {
                self.encuestas([]);
                $.each(data, function (i, el) {
                    self.encuestas.push(new PollItem(el));
                });
            },
            error: function (xhr, ajaxOptions, thrownError) {
                alert('error');
            }
        });

        self.initTable();
    };
    self.initTable = function () {
        encuestaTable = $('#encuestaTable').DataTable({
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
    self.hideAddEditForm = function () {
        self.divPrincipalVisible(true);
        self.divAddEditVisible(false);
        self.divDetailVisible(false);
        if (preguntaTable != null) {
            preguntaTable.clear();
            preguntaTable.destroy();
            preguntaTable = null;
        }
    };


    //INIT: ENCUESTAS
    self.editPoll = function (data) {
        self.selectedPoll(data);
        self.pollName(data.Nombre());
        self.vigencia(data.Vigencia());
        //Si se desea agregar territorios, se debe inicializar con "" y mostrar la sección y asignar valores
    };
    self.pollChanges = function () {
        if (self.selectedPoll() == undefined) {
            self.saveNewPoll();
        }
        else {
            self.saveEditPoll();
        }
    };
    self.saveNewPoll = function () {
        var error = false;
        if (self.pollName() == undefined || self.pollName().trim() == '') {
            $('#pollName').attr('required', 'required');
            error = true;
        }
        else {
            $('#pollName').removeAttr('required');
        }

        if (self.vigencia() == undefined || self.vigencia().trim() == '') {
            $('#vigencia').attr('required', 'required');
            error = true;
        }
        else {
            $('#vigencia').removeAttr('required');
        }

        var responseValidate = self.addEditValidate();
        if (responseValidate) {
            return;
        }

        if (error) {
            //alert('Hay campos requeridos');
        }
        else {
            $('#pollName').removeAttr('required');
            $('#vigencia').removeAttr('required');
            $('#addEditState').removeAttr('required');
            $('#newPoll').modal('hide');

            var encuesta = self.pollName();
            var vigencia = self.vigencia();
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
                url: '/Poll/AddPoll',
                data: ko.toJSON({ criteria: criteria, encuesta: encuesta, vigencia: vigencia }),
                async: false,
                dataType: "json",
                contentType: "application/json; charset=utf-8",
                success: function (data) {
                    self.showAlertMessage('Encuesta creada correctamente');
                    self.search();
                    self.resetNewPoll();
                },
                error: function (xhr, ajaxOptions, thrownError) {
                    alert('error');
                }
            });
        }
    };
    self.saveEditPoll = function () {
        var error = false;
        if (self.pollName() == undefined || self.pollName().trim() == '') {
            $('#pollName').attr('required', 'required');
            error = true;
        }
        else {
            $('#pollName').removeAttr('required');
        }

        if (self.vigencia() == undefined || self.vigencia().trim() == '') {
            $('#vigencia').attr('required', 'required');
            error = true;
        }
        else {
            $('#vigencia').removeAttr('required');
        }

        if (error) {
            //alert('Hay campos requeridos');
        }
        else {
            $('#pollName').removeAttr('required');
            $('#vigencia').removeAttr('required');
            $('#newPoll').modal('hide');

            var idEncuesta = self.selectedPoll().IdEncuesta();
            var encuesta = self.pollName();
            var vigencia = self.vigencia();

            $.ajax({
                type: 'Post',
                url: '/Poll/EditPoll',
                data: ko.toJSON({ idEncuesta: idEncuesta, encuesta: encuesta, vigencia: vigencia }),
                async: false,
                dataType: "json",
                contentType: "application/json; charset=utf-8",
                success: function (data) {
                    self.showAlertMessage('Encuesta actualizada correctamente');
                    self.selectedPoll().Nombre(encuesta);
                    self.selectedPoll().Vigencia(vigencia);
                    self.resetNewPoll();
                },
                error: function (xhr, ajaxOptions, thrownError) {
                    alert('error');
                }
            });
        }
    };
    self.resetNewPoll = function () {
        self.pollName('');
        self.vigencia('');
        self.addEditReset();
        self.selectedPoll(undefined);
    };
    self.initValuesNewPoll = function () {
        self.getAddEditStates();
        self.addEditInitFilter();
        self.selectedPoll(undefined);
    };
    self.confirmDeletePoll = function (e) {
        swal({
            title: '¿Desea eliminar la encuesta?',
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
                self.deletePoll(e);
            }
        });
    };
    self.deletePoll = function (data) {
        if (data.CantidadParticipantes() > 0) {
            alert('No se puede borrar una encuesta que ya ha sido contestada.');
        }
        var encuestaId = data.IdEncuesta();
        $.ajax({
            type: 'GET',
            url: '/Poll/DeletePoll',
            data: { pollId: encuestaId },
            async: false,
            dataType: "json",
            contentType: "application/json; charset=utf-8",
            success: function (d) {
                if (d) {
                    self.showAlertMessage('Encuesta eliminada correctamente');
                    self.getData();
                    //var matchedItem = self.encuestas().filter(function (item) {
                    //    return item.IdEncuesta() == encuestaId;
                    //})[0];

                    //self.encuestas.remove(matchedItem);

                }
            },
            error: function (xhr, ajaxOptions, thrownError) {

            }
        });
    };
    self.confirmChangeStatusPoll = function (e) {
        swal({
            title: e.Activo() ? '¿Desea desactivar la encuesta?' : '¿Desea activar la encuesta?',
            text: e.Activo() ? '¡La encuesta ya no podrá ser contestada!' : '¡La encuesta podrá ser contestada!',
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
                self.pollChangeStatus(e);
            }
        });
    };
    self.pollChangeStatus = function (data) {
        var idEncuesta = data.IdEncuesta();
        $.ajax({
            type: 'GET',
            url: '/Poll/ChangeStatusPoll',
            data: { idEncuesta: idEncuesta },
            async: false,
            dataType: "json",
            contentType: "application/json; charset=utf-8",
            success: function (r) {
                data.Activo(!data.Activo());
                //self.showAlertMessage('Estatus de la encuesta cambiado correctamente');
            },
            error: function (xhr, ajaxOptions, thrownError) {

            }
        });
    };
    //INIT: ENCUESTAS


    //INIT: PREGUNTAS
    self.showQuestions = function (data) {
        if (preguntaTable != null) {
            preguntaTable.clear();
            preguntaTable.destroy();
            preguntaTable = null;
        }
        var idEncuesta = data.IdEncuesta();
        $.ajax({
            type: 'Post',
            url: '/Poll/GetPoll',
            data: ko.toJSON({ idEncuesta: idEncuesta }),
            async: false,
            dataType: "json",
            contentType: "application/json; charset=utf-8",
            success: function (data) {
                var poll = new PollItem(data);
                self.selectedPoll(poll);

                self.divPrincipalVisible(false);
                self.divDetailVisible(false);
                self.divAddEditVisible(true);
            },
            error: function (xhr, ajaxOptions, thrownError) {
                alert('error');
            }
        });

        //No funciona con tablas anidadas
        //self.initQuestionTable();
    }
    self.initQuestionTable = function () {

        preguntaTable = $('#questionTable').DataTable({
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
    self.editQuestion = function (data) {
        self.selectedQuestion(data);
        self.currentQuestion(data.Pregunta());
        if (data.EsAbierta()) {
            self.questionType('open');
        }
        if (data.EsMultiple()) {
            self.questionType('multiple');
        }
        if (data.EsIndividual()) {
            self.questionType('individual');
        }

        if ((data.EsMultiple() || data.EsIndividual()) && data.Respuestas().length > 0) {
            $('#radioGroupQuestionType').hide();
        }
        else {
            $('#radioGroupQuestionType').show();
        }
    };
    self.questionChanges = function () {
        if (self.selectedQuestion() == undefined) {
            self.saveAddQuestion();
        }
        else {
            self.saveEditQuestion();
        }
    };
    self.saveAddQuestion = function () {
        var error = false;
        if (self.currentQuestion() == undefined || self.currentQuestion().trim() == '') {
            $('#questionName').attr('required', 'required');
            error = true;
        }
        else {
            $('#questionName').removeAttr('required');
        }

        if (error) {
            //alert('Hay campos requeridos');
        }
        else {
            $('#questionName').removeAttr('required');
            $('#newQuestion').modal('hide');

            var idEncuesta = self.selectedPoll().IdEncuesta();
            var pregunta = self.currentQuestion();
            var typeId = self.questionType() == 'individual'
                ? 1 : self.questionType() == 'multiple' ? 2 : 3;

            $.ajax({
                type: 'Post',
                url: '/Poll/AddQuestion',
                data: ko.toJSON({ idEncuesta: idEncuesta, pregunta: pregunta, typeId: typeId }),
                async: false,
                dataType: "json",
                contentType: "application/json; charset=utf-8",
                success: function (data) {
                    var question = new QuestionItem(data);
                    self.selectedPoll().Preguntas.push(question);

                    var element = $.grep(self.encuestas(), function (item) {
                        return item.IdEncuesta() == idEncuesta;
                    });

                    var c = self.selectedPoll().CantidadPreguntas();
                    element[0].CantidadPreguntas(c + 1);
                    self.initPopUpQuestion();

                    self.showAlertMessage('Pregunta agregada correctamente');
                },
                error: function (xhr, ajaxOptions, thrownError) {
                    alert('error');
                }
            });
        }
    };
    self.saveEditQuestion = function () {
        var error = false;
        if (self.currentQuestion() == undefined || self.currentQuestion().trim() == '') {
            $('#questionName').attr('required', 'required');
            error = true;
        }
        else {
            $('#questionName').removeAttr('required');
        }

        if (error) {
            //alert('Hay campos requeridos');
        }
        else {
            $('#questionName').removeAttr('required');
            $('#newQuestion').modal('hide');

            var idPregunta = self.selectedQuestion().IdPregunta();
            var pregunta = self.currentQuestion();
            var typeId = self.questionType() == 'individual'
                ? 1 : self.questionType() == 'multiple' ? 2 : 3;

            $.ajax({
                type: 'Post',
                url: '/Poll/EditQuestion',
                data: ko.toJSON({ idPregunta: idPregunta, pregunta: pregunta, typeId: typeId }),
                async: false,
                dataType: "json",
                contentType: "application/json; charset=utf-8",
                success: function (data) {
                    self.showAlertMessage('Pregunta actualizada correctamente');
                    self.selectedQuestion().Pregunta(pregunta);
                    self.selectedQuestion().EsAbierta(typeId == 3);
                    self.selectedQuestion().EsMultiple(typeId == 2);
                    self.selectedQuestion().EsIndividual(typeId == 1);
                    self.resetNewQuestion();
                },
                error: function (xhr, ajaxOptions, thrownError) {
                    alert('error');
                }
            });
        }
    };
    self.resetNewQuestion = function () {
        self.currentQuestion('');
        self.questionType('multiple');
        self.selectedQuestion(undefined);
    }
    self.closePopQuestion = function () {
        self.initPopUpQuestion();
    };
    self.initPopUpQuestion = function () {
        self.currentQuestion('');
        self.questionType('multiple');
        self.selectedQuestion(undefined);
    };
    self.confirmDeleteQuestion = function (e) {
        swal({
            title: '¿Desea eliminar la pregunta?',
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
                self.deleteQuestion(e);
            }
        });
    };
    self.deleteQuestion = function (data) {
        if (data.CantidadParticipantes() > 0) {
            alert('No se puede borrar una pregunta que ya ha sido contestada.');
        }

        var idPregunta = data.IdPregunta();
        $.ajax({
            type: 'GET',
            url: '/Poll/DeleteQuestion',
            data: { idPregunta: idPregunta },
            async: false,
            dataType: "json",
            contentType: "application/json; charset=utf-8",
            success: function (res) {
                if (res) {
                    self.selectedPoll().Preguntas.remove(data);

                    var element = $.grep(self.encuestas(), function (item) {
                        return item.IdEncuesta() == self.selectedPoll().IdEncuesta();
                    });

                    var c = self.selectedPoll().CantidadPreguntas();
                    element[0].CantidadPreguntas(c - 1);
                    self.showAlertMessage('Pregunta eliminada correctamente');
                }
            },
            error: function (xhr, ajaxOptions, thrownError) {

            }
        });
    };
    self.confirmChangeStatusQuestion = function (e) {
        swal({
            title: e.Activo() ? '¿Desea desactivar la pregunta?' : '¿Desea activar la pregunta?',
            text: e.Activo() ? '¡La pregunta ya no podrá ser contestada!' : '¡La pregunta podrá ser contestada!',
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
                self.QuestionChangeStatus(e);
            }
        });
    };
    self.QuestionChangeStatus = function (data) {
        var idPregunta = data.IdPregunta();
        $.ajax({
            type: 'GET',
            url: '/Poll/ChangeStatusQuestion',
            data: { idPregunta: idPregunta },
            async: false,
            dataType: "json",
            contentType: "application/json; charset=utf-8",
            success: function (r) {
                data.Activo(!data.Activo());
                //self.showAlertMessage('Estatus de la pregunta cambiado correctamente');
            },
            error: function (xhr, ajaxOptions, thrownError) {

            }
        });
    };
    //INIT: PREGUNTAS


    //INIT: RESPUESTAS
    self.addAnswer = function (data) {
        self.selectedQuestion(data);
    };
    self.editAnswer = function (data) {
        self.selectedAnswer(data);
        self.currentAnswer(data.Respuesta());
    };
    self.answerChanges = function () {
        if (self.selectedAnswer() == undefined) {
            self.saveAddAnswer();
        }
        else {
            self.saveEditAnswer();
        }
    };
    self.saveAddAnswer = function () {
        var error = false;
        if (self.currentAnswer() == undefined || self.currentAnswer().trim() == '') {
            $('#answerName').attr('required', 'required');
            error = true;
        }
        else {
            $('#answerName').removeAttr('required');
        }

        if (error) {
            //alert('Hay campos requeridos');
        }
        else {
            $('#answerName').removeAttr('required');
            $('#newAnswer').modal('hide');

            var idPregunta = self.selectedQuestion().IdPregunta();
            var respuesta = self.currentAnswer();

            $.ajax({
                type: 'Post',
                url: '/Poll/AddAnswer',
                data: ko.toJSON({ idPregunta: idPregunta, respuesta: respuesta }),
                async: false,
                dataType: "json",
                contentType: "application/json; charset=utf-8",
                success: function (data) {
                    var answer = new AnswerItem(data);
                    self.selectedQuestion().Respuestas.push(answer);
                    self.initPopUpAnswer();
                    self.showAlertMessage('Respuesta agregada correctamente');
                },
                error: function (xhr, ajaxOptions, thrownError) {
                    alert('error');
                }
            });
        }
    };
    self.saveEditAnswer = function () {
        var error = false;
        if (self.currentAnswer() == undefined || self.currentAnswer().trim() == '') {
            $('#answerName').attr('required', 'required');
            error = true;
        }
        else {
            $('#answerName').removeAttr('required');
        }

        if (error) {
            //alert('Hay campos requeridos');
        }
        else {
            $('#answerName').removeAttr('required');
            $('#newAnswer').modal('hide');

            var idRespuesta = self.selectedAnswer().IdRespuesta();
            var respuesta = self.currentAnswer();

            $.ajax({
                type: 'Post',
                url: '/Poll/EditAnswer',
                data: ko.toJSON({ idRespuesta: idRespuesta, respuesta: respuesta }),
                async: false,
                dataType: "json",
                contentType: "application/json; charset=utf-8",
                success: function (data) {
                    self.selectedAnswer().Respuesta(respuesta);
                    self.initPopUpAnswer();
                    self.showAlertMessage('Respuesta actualizada correctamente');
                },
                error: function (xhr, ajaxOptions, thrownError) {
                    alert('error');
                }
            });


        }
    };
    self.closePopAnswer = function () {
        self.initPopUpAnswer();
    };
    self.initPopUpAnswer = function () {
        self.selectedQuestion(undefined);
        self.currentAnswer('');
        self.selectedAnswer(undefined);
    };
    self.confirmDeleteAnswer = function (e) {
        swal({
            title: '¿Desea eliminar la respuesta?',
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
                self.deleteAnswer(e);
            }
        });
    };
    self.deleteAnswer = function (data) {
        if (data.CantidadParticipantes() > 0) {
            alert('No se puede borrar una respuesta que ya ha sido contestada.');
        }

        var idRespuesta = data.IdRespuesta();
        $.ajax({
            type: 'GET',
            url: '/Poll/DeleteAnswer',
            data: { idRespuesta: idRespuesta },
            async: false,
            dataType: "json",
            contentType: "application/json; charset=utf-8",
            success: function (res) {
                if (res) {
                    var preguntas = $.grep(self.selectedPoll().Preguntas(), function (item) {
                        return item.IdPregunta() == data.IdPregunta();
                    });
                    var pregunta = preguntas[0];
                    pregunta.Respuestas.remove(data);
                    self.showAlertMessage('Respuesta eliminada correctamente');
                }
            },
            error: function (xhr, ajaxOptions, thrownError) {

            }
        });
    };
    self.confirmChangeStatusAnswer = function (e) {
        swal({
            title: e.Activo() ? '¿Desea desactivar la respuesta?' : '¿Desea activar la respuesta?',
            text: e.Activo() ? '¡La respuesta ya no podrá ser contestada!' : '¡La respuesta podrá ser contestada!',
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
                self.AnswerChangeStatus(e);
            }
        });
    };
    self.AnswerChangeStatus = function (data) {
        var idRespuesta = data.IdRespuesta();
        $.ajax({
            type: 'GET',
            url: '/Poll/ChangeStatusAnswer',
            data: { idRespuesta: idRespuesta },
            async: false,
            dataType: "json",
            contentType: "application/json; charset=utf-8",
            success: function (r) {
                data.Activo(!data.Activo());
                //self.showAlertMessage('Estatus de la respuesta cambiado correctamente');
            },
            error: function (xhr, ajaxOptions, thrownError) {

            }
        });
    };
    //INIT: RESPUESTAS


    //INIT: DETALLES
    self.showDetail = function (data) {
        self.pollName(data.Nombre());
        self.vigencia(data.Vigencia());
        var idEncuesta = data.IdEncuesta();
        $.ajax({
            type: 'Post',
            url: '/Poll/GetPoll',
            data: ko.toJSON({ idEncuesta: idEncuesta }),
            async: false,
            dataType: "json",
            contentType: "application/json; charset=utf-8",
            success: function (data) {
                var poll = new PollItem(data);
                self.selectedPollDetail(poll);

                self.divDetailVisible(true);
                self.divPrincipalVisible(false);
                self.divAddEditVisible(false);

                self.initDetailRadialGraphic();
                self.initDetailLinealGraphic();
            },
            error: function (xhr, ajaxOptions, thrownError) {
                alert('error');
            }
        });
    };
    self.initDetailRadialGraphic = function () {
        var controles = $("canvas[id^='RadialAnswer_']");
        var configGraphic = [];
        $.each(controles, function (i, control) {
            var pieColors = [];
            var names = [];
            var values = [];
            var colors = ['#FF3633', '#FF7D33', '#FFDA33', '#CAFF33', '#8AFF33', '#36FF33',
                '#33FFAC', '#33FFE6', '#33E9FF', '#33A8FF', '#3361FF', '#4933FF',
                '#7A33FF', '#BE33FF', '#F933FF', '#FF33D7', '#FF33A8',
                '#FF3374', '#FF335E', '#0B0A0A', '#FAF6F6', '#C8C8C8',
                '#9A9999', '#595858'];
            $.each(self.selectedPollDetail().Preguntas()[i].Respuestas(), function (j, respuesta) {
                if (colors.length > 0) {
                    var color = colors[Math.floor(Math.random() * colors.length)];
                    pieColors.push(color);
                    colors.remove(color);
                }
                else {
                    var randomColor = Math.floor(Math.random() * 16777215).toString(16);
                    pieColors.push(randomColor);
                }

                names.push(respuesta.Respuesta());
                values.push(respuesta.CantidadParticipantes());

                configGraphic.push({
                    ControlId: control.id,
                    Colors: pieColors,
                    Names: names,
                    Values: values
                });
            });

            $.each(configGraphic, function (i, graphic) {
                var pieData = {
                    labels: graphic.Names,
                    datasets: [{
                        data: graphic.Values,
                        backgroundColor: graphic.Colors,
                        hoverBackgroundColor: graphic.Colors,
                        borderColor: 'rgba(0,0,0,1)',
                    }]
                };
                var pieOptions = {
                    legend: {
                        display: true
                    }
                };

                var piectx = document.getElementById(graphic.ControlId).getContext('2d');
                var pieChart = new Chart(piectx, {
                    data: pieData,
                    type: 'pie',
                    options: pieOptions
                });
            });
        });
    }
    self.initDetailLinealGraphic = function () {
        var controles = $("canvas[id^='LinealAnswer_']");
        var configGraphic = [];
        $.each(controles, function (i, control) {
            var pieColors = [];
            var names = [];
            var values = [];
            var colors = ['#FF3633', '#FF7D33', '#FFDA33', '#CAFF33', '#8AFF33', '#36FF33',
                '#33FFAC', '#33FFE6', '#33E9FF', '#33A8FF', '#3361FF', '#4933FF',
                '#7A33FF', '#BE33FF', '#F933FF', '#FF33D7', '#FF33A8',
                '#FF3374', '#FF335E', '#0B0A0A', '#FAF6F6', '#C8C8C8',
                '#9A9999', '#595858'];
            //var colors = ['#F70505', '#E5F705', '#52F705', '#05F7E8', '#055DF7', '#B905F7', '#F305F7', '#F70505'];
            $.each(self.selectedPollDetail().Preguntas()[i].Respuestas(), function (j, respuesta) {
                if (colors.length > 0) {
                    var color = colors[Math.floor(Math.random() * colors.length)];
                    pieColors.push(color);
                    colors.remove(color);
                }
                else {
                    var randomColor = Math.floor(Math.random() * 16777215).toString(16);
                    pieColors.push(randomColor);
                }

                names.push(respuesta.Respuesta());
                values.push(respuesta.CantidadParticipantes());

                configGraphic.push({
                    ControlId: control.id,
                    Colors: pieColors,
                    Names: names,
                    Values: values
                });
            });

            $.each(configGraphic, function (i, graphic) {
                var barData = {
                    labels: graphic.Names,
                    datasets: [{
                        backgroundColor: '#057EF7',
                        borderColor: '#FFFFFF',
                        data: graphic.Values
                    }]
                };

                var barOptions = {
                    legend: {
                        display: false
                    }
                };

                var barctx = document.getElementById(graphic.ControlId).getContext('2d');
                var barChart = new Chart(barctx, {
                    data: barData,
                    type: 'bar',
                    options: barOptions
                });
            });
        });
    }
    self.viewOpenAnswers = function (question) {
        self.currentQuestionDetail(question);
    };
    //INIT: DETALLES


    Array.prototype.remove = function (item) {
        for (let i = 0; i < this.length; i++) {
            if (this[i] === item) {
                this.splice(i, 1);
            }
        }
    }

    self.ExpandCollapse = function (data) {
        if (data.IsExpanded()) {
            data.IsExpanded(false);
        }
        else {
            data.IsExpanded(true);
        }
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