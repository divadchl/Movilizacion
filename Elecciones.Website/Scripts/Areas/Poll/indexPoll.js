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
    self.Respuesta = ko.observable(data.Answer);
    self.Activo = ko.observable(data.Activo);
}

function QuestionItem(data) {
    var self = this;
    self.IdPregunta = ko.observable(data.Identifier);
    self.Pregunta = ko.observable(data.Question);
    self.EsAbierta = ko.observable(data.IsOpen);
    self.EsMultiple = ko.observable(data.IsMultiple);
    self.EsIndividual = ko.observable(data.IsIndividual);
    self.CantidadParticipantes = ko.observable(data.CantidadParticipantes);
    self.Activo = ko.observable(data.Activo);
    self.Respuestas = ko.observableArray([]);
    if (data.AnswerList != undefined) {
        $.each(data.AnswerList, function (i, item) {
            var answer = new AnswerItem(item);
            self.Respuestas.push(answer);
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
    var table = null;
    self.divPrincipalVisible = ko.observable(true);
    self.divAddEditVisible = ko.observable(false);

    self.encuestas = ko.observableArray([]);
    self.selectedPoll = ko.observable(undefined);
    self.pollName = ko.observable();
    self.vigencia = ko.observable();

    self.questions = ko.observableArray([]);
    self.selectedQuestion = ko.observable(undefined);
    self.questionType = ko.observable('multiple');
    self.currentQuestion = ko.observable('');

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
            self.encuestas([]);
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
    };

    self.getData = function () {
        if (table != null) {
            table.clear();
            table.destroy();
            table = null;
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

        table = $('#encuestaTable').DataTable({
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
            alert('Hay campos requeridos');
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
                    alert("Encuesta creada correctamente");
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
            alert('Hay campos requeridos');
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
                    alert("Encuesta actualizada correctamente");
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

        if (data.EsMultiple() || data.EsIndividual()) {
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
            alert('Hay campos requeridos');
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
            alert('Hay campos requeridos');
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
                    alert("Pregunta actualizada correctamente");
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
    };



    self.initValuesNewPoll = function () {
        self.getAddEditStates();
        self.addEditInitFilter();
        self.selectedPoll(undefined);
    };

    self.showQuestions = function (data) {
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
                self.divAddEditVisible(true);
            },
            error: function (xhr, ajaxOptions, thrownError) {
                alert('error');
            }
        });
    }

    self.closePopQuestion = function () {
        self.initPopUpQuestion();
    };

    self.initPopUpQuestion = function () {
        self.currentQuestion('');
        self.questionType('multiple');
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
            success: function (data) {
                if (data) {
                    self.encuestas.remove(data);
                }
            },
            error: function (xhr, ajaxOptions, thrownError) {

            }
        });
    };

    self.confirmChangeStatusPoll = function (e) {
        swal({
            title: '¿Desea cambiarle el estatus a la encuesta?',
            text: e.Activo() ? '¡La encuesta ya no podrá ser contestada!' : '',
            icon: e.Activo() ? 'warning' : '',
            buttons: {
                cancel: true,
                confirm: {
                    text: 'Si',
                    value: true,
                    visible: true,
                    className: e.Activo() ? "bg-danger" : '',
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
            },
            error: function (xhr, ajaxOptions, thrownError) {

            }
        });
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
                }
            },
            error: function (xhr, ajaxOptions, thrownError) {

            }
        });
    };

    self.confirmChangeStatusQuestion = function (e) {
        swal({
            title: '¿Desea cambiarle el estatus a la pregunta?',
            text: e.Activo() ? '¡La pregunta ya no podrá ser contestada!' : '',
            icon: e.Activo() ? 'warning' : '',
            buttons: {
                cancel: true,
                confirm: {
                    text: 'Si',
                    value: true,
                    visible: true,
                    className: e.Activo() ? "bg-danger" : '',
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
            },
            error: function (xhr, ajaxOptions, thrownError) {

            }
        });
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