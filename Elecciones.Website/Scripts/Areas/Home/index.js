function ViewModel() {
    var self = this;
    self.selectedProcess = ko.observable();
    self.processList = ko.observableArray([]);

    self.getProcessUser = function () {
        $.ajax({
            type: 'GET',
            url: '/Home/GetProcessUser',
            async: false,
            dataType: "json",
            contentType: "application/json; charset=utf-8",
            success: function (data) {
                self.processList(data);
            },
            error: function (xhr, ajaxOptions, thrownError) {

            }
        });
    };

    self.selectedProcess.subscribe(function () {
        if (self.selectedProcess() != undefined) {
            $.ajax({
                type: 'POST',
                url: '/Home/SetProcess',
                data: ko.toJSON({ processId: self.selectedProcess() }),
                async: false,
                dataType: "json",
                contentType: "application/json; charset=utf-8",
                success: function (data) {
                },
                error: function (xhr, ajaxOptions, thrownError) {

                }
            });
        }
    });

    self.getCurrentProcess = function () {
        $.ajax({
            type: 'POST',
            url: '/Home/GetCurrentProcess',
            async: false,
            dataType: "json",
            contentType: "application/json; charset=utf-8",
            success: function (data) {
                if (data != "") {
                    var current = $.grep(self.processList(), function (item) {
                        return item.Id == data;
                    });
                    self.selectedProcess(current[0].Id);
                }
            },
            error: function (xhr, ajaxOptions, thrownError) {

            }
        });
    };

    self.getProcessUser();
    self.getCurrentProcess();
}


$(function () {
    var model = new ViewModel();
    ko.applyBindings(model);
});