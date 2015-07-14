'use strict';
angular.module('csvFlashcardsApp').controller('MainCtrl', function($scope) {
    $scope.groupedQuestions = [];
    $scope.groupedAnswers = [];

    function groupList(list, reverse) {
        var groupedItems = [];
        var groupedBy20 = _.toArray(_.groupBy(list, function(element, index) {
            return Math.floor(index / 8);
        }));
        for (var i = 0; i < groupedBy20.length; i++) {
            var groupedBy2 = _.groupBy(groupedBy20[i], function(element, index) {
                return Math.floor(index / 2);
            });
            if (reverse) {
                groupedItems.push(_.toArray(groupedBy2).reverse());
            } else {
                groupedItems.push(_.toArray(groupedBy2));
            }
        }
        return groupedItems;
    }

    $scope.loadSampleData = function() {
        var select = document.getElementById('csv-sample');
        document.getElementById('flashcards-container').style.display = 'none';
        document.getElementById('print').style.display = 'none';
        document.getElementById('print-title').style.display = 'none';
        if (select.value !== '') {
            document.getElementById('print-progress').style.display = '';
            document.getElementById('print-title').style.display = '';
            document.getElementById('print-title').innerHTML = 'Loading ' + select.options[select.selectedIndex].innerHTML + '...';
            $.get('/files/' + select.value).done(function(data) {
                Papa.parse(data, {
                    complete: function(results) {
                        parseCsv(results.data);
                    }
                });
            });
        }
    }

    function parseCsv(csv) {
        var questions = [];
        var answers = [];
        for (var i = 0; i < csv.length; i++) {
            if (csv[i].length === 3) {
                if (csv[i][1] !== 'Question') {
                    var question = formatQuestion({
                        title: csv[i][1],
                        number: csv[i][0],
                        long: false
                    })
                    questions.push(question);
                    var answer = formatAnswer({
                        title: csv[i][2],
                        number: csv[i][0],
                        long: false
                    });
                    answers.push(answer);
                }
            }
        }
        $scope.$apply(function() {
            $scope.groupedQuestions = groupList(questions);
            $scope.groupedAnswers = groupList(answers, true);
            $scope.print();
        });
    }

    $scope.uploadFromCsv = function() {
        var file = document.getElementById("style-guide-file");
        Papa.parse(file.files[0], {
            complete: function(results) {
                parseCsv(results.data);
            }
        });
    }

    $scope.print = function() {
        // var html = '<!doctype html><html><head><meta charset="utf-8"><style>';
        // $.get('/styles/flashcards.css').done(function(data) {
        //     html += data;
        //     html += '</style>'
        //     html += $('#answers').html();
        //     html += '<script>window.print();</script></body></html>';
        //     var csv = btoa(unescape(encodeURIComponent(html)));
        //     var w = window.open("data:text/html;base64," + csv, "FlashCards");
        //     w.focus();
        //     w.print();
        // });
        //setTimeout(function() { //HACK: Not sure when DOM is rendered
        document.getElementById('print-title').innerText = document.getElementById('print-title').innerText.replace('Loading ', '').replace('...', '');
        document.getElementById('flashcards-container').style.display = '';
        document.getElementById('print').style.display = '';
        document.getElementById('print-progress').style.display = 'none';
        //}, 5 * $scope.groupedQuestions.length);        
    }

    $scope.popupPrint = function() {
        var html = '<!doctype html><html><head><meta charset="utf-8"><style>';
        $.get('/files/csv-flashcards.css').done(function(data) {
            html += data;
            html += '</style>'
            html += $('#flashcards-container').html();
            html += '<script>window.print();</script></body></html>';
            var csv = btoa(unescape(encodeURIComponent(html)));
            var w = window.open("data:text/html;base64," + csv, "FlashCards");
            w.focus();
            w.print();
        });
    }

    function CustomReplace(strData, strTextToReplace, strReplaceWith, replaceAt) {
        var index = strData.indexOf(strTextToReplace);
        for (var i = 1; i < replaceAt; i++)
            index = strData.indexOf(strTextToReplace, index + 1);
        if (index >= 0)
            return strData.substr(0, index) + strReplaceWith + strData.substr(index + strTextToReplace.length, strData.length);
        return strData;
    }

    function formatQuestion(card) {
        if (card.title) {

        }
        return card;
    }

    function formatAnswer(card) {
        if (card.title) {
            card.originalLength = card.title.length;
            if (card.title.indexOf(' (') !== -1) {
                //card.title = CustomReplace(card.title, '(', '<br /><br />(', 2);
            }
            if (card.title.length > 450) {
                card.long = true;
                if (card.title.length > 650) {
                    card.title = card.title.substring(0, 650) + '...'
                }
            }
        }
        return card;
    }
});
