//
//  converter.js
//  Mr-Data-Converter
//
//  Created by Shan Carter on 2010-09-01.
//



function DataConverter(nodeId) {

  //---------------------------------------
  // PUBLIC PROPERTIES
  //---------------------------------------

  this.nodeId                 = nodeId;
  this.node                   = $("#"+nodeId);

  this.outputDataTypes        = [
                                {"text":"HTML",                   "id":"html",             "notes":""},
                                {"text":"Actionscript",           "id":"as",               "notes":""},
                                {"text":"ASP/VBScript",           "id":"asp",              "notes":""},
                                {"text":"JSON - Properties",      "id":"json",             "notes":""},
                                {"text":"JSON - Column Arrays",   "id":"jsonArrayCols",    "notes":""},
                                {"text":"JSON - Row Arrays",      "id":"jsonArrayRows",    "notes":""},
                                {"text":"JSON - Dictionary",      "id":"jsonDict",         "notes":""},
                                {"text":"MySQL",                  "id":"mysql",            "notes":""},
                                {"text":"PHP",                    "id":"php",              "notes":""},
                                {"text":"Python - Dict",          "id":"python",           "notes":""},
                                {"text":"Ruby",                   "id":"ruby",             "notes":""},
                                {"text":"XML - Properties",       "id":"xmlProperties",    "notes":""},
                                {"text":"XML - Nodes",            "id":"xml",              "notes":""},
                                {"text":"XML - Illustrator",      "id":"xmlIllustrator",   "notes":""}];
  this.outputDataType         = "html";

  this.columnDelimiter        = "\t";
  this.rowDelimiter           = "\n";

  this.inputTextArea          = {};
  this.outputTextArea         = {};

  this.inputHeader            = {};
  this.outputHeader           = {};
  this.dataSelect             = {};

  this.inputText              = "";
  this.outputText             = "";

  this.newLine                = "\n";
  this.indent                 = "  ";

  this.commentLine            = "//";
  this.commentLineEnd         = "";
  this.tableName              = "MrDataConverter"

  this.useUnderscores         = true;
  this.headersProvided        = true;
  this.downcaseHeaders        = true;
  this.upcaseHeaders          = false;
  this.includeWhiteSpace      = true;
  this.useTabsForIndent       = false;

}

//---------------------------------------
// PUBLIC METHODS
//---------------------------------------

DataConverter.prototype.create = function(w,h) {
  var self = this;

  //build HTML for converter
  this.inputHeader = $('<div class="groupHeader" id="inputHeader"><p class="groupHeadline">Input CSV or tab-delimited data. <span class="subhead"> Using Excel? Simply copy and paste. No data on hand? <a href="#" id="insertSample">Use sample</a></span></p></div>');
  this.inputTextArea = $('<textarea class="textInputs" id="dataInput"></textarea>');
  var outputHeaderText = '<div class="groupHeader hide" id="inputHeader"><p class="groupHeadline">Output as <select name="Data Types" id="dataSelector" >';
    for (var i=0; i < this.outputDataTypes.length; i++) {

      outputHeaderText += '<option value="'+"html"+'" '
              + ("html" == this.outputDataType ? 'selected="selected"' : '')
              + '>'
              + this.outputDataTypes[i]["text"]+'</option>';
    };
    outputHeaderText += '</select><span class="subhead" id="outputNotes"></span></p></div>';
  this.outputHeader = $(outputHeaderText);
  this.outputTextArea = $('<textarea class="textInputs" id="dataOutput"></textarea>');

  this.node.append(this.inputHeader);
  this.node.append(this.inputTextArea);
  this.node.append(this.outputHeader);
  this.node.append(this.outputTextArea);

  this.dataSelect = this.outputHeader.find("#dataSelector");


  //add event listeners

  // $("#convertButton").bind('click',function(evt){
  //   evt.preventDefault();
  //   self.convert();
  // });

  this.outputTextArea.click(function(evt){this.select();});


  $("#insertSample").bind('click',function(evt){
    evt.preventDefault();
    self.insertSampleData();
    self.convert();
    _gaq.push(['_trackEvent', 'SampleData','InsertGeneric']);
  });

  $("#dataInput").keyup(function() {self.convert()});
  $("#dataInput").change(function() {
    self.convert();
    _gaq.push(['_trackEvent', 'DataType',self.outputDataType]);
  });

  $("#dataSelector").bind('change',function(evt){
       self.outputDataType = $(this).val();
       self.convert();
     });

  this.resize(w,h);
}

DataConverter.prototype.resize = function(w,h) {

  var paneWidth = w;
  var paneHeight = (h-90)/2-20;

  this.node.css({width:paneWidth});
  this.inputTextArea.css({width:paneWidth-20,height:paneHeight});
  this.outputTextArea.css({width: paneWidth-20, height:paneHeight});

}

DataConverter.prototype.convert = function() {

  this.inputText = this.inputTextArea.val();
  this.outputText = "";


  //make sure there is input data before converting...
  if (this.inputText.length > 0) {

    if (this.includeWhiteSpace) {
      this.newLine = "\n";
      // console.log("yes")
    } else {
      this.indent = "";
      this.newLine = "";
      // console.log("no")
    }

    CSVParser.resetLog();
    var parseOutput = CSVParser.parse(this.inputText, this.headersProvided, this.delimiter, this.downcaseHeaders, this.upcaseHeaders);

    var dataGrid = parseOutput.dataGrid;
    var headerNames = parseOutput.headerNames;
    var headerTypes = parseOutput.headerTypes;
    var errors = parseOutput.errors;

    this.outputText = DataGridRenderer[this.outputDataType](dataGrid, headerNames, headerTypes, this.indent, this.newLine);


    this.outputTextArea.val(errors + this.outputText);

  }; //end test for existence of input text
}


DataConverter.prototype.insertSampleData = function() {
  this.inputTextArea.val(" ,United States,Mexico,Latin America,China,Other Asia,All Other,Foreign-born Mother\nHighest Education of Mothers,,,,,,,\nLess than HS,0.11,0.56^,0.32^,0.06^,0.12,0.1,0.36^\n\"HS Diploma, GED\",0.27,0.26,0.31,0.11^,0.19^,0.29,0.27\nSome College,0.34,0.11^,0.28,0.11^,0.22^,0.29,0.19^\nBA and higher,0.28,0.07^,0.10^,0.72^,0.48^,0.32,0.19^\nChild is Female,0.49,0.45,0.52,0.47,0.48,0.51,0.48\nSingle Parent or Other Family,0.32,0.15^,0.25,0.02^,0.10^,0.19^,0.17^\nHas a Twin,0.02,0.01,,,0.02,,0.01^\nChild's Age,4.35,4.45^,4.45^,4.47^,4.43^,4.39,4.44^\n,-0.3,-0.4,-0.4,-0.4,-0.4,-0.4,-0.4\nNumber of Siblings (mean),1.4,1.7^,1.2,0.9^,1.2^,1.4,1.4\n,-1.1,-1.2,-1.1,-0.7,-1,-1.2,-1.2\nMother's Age (mean),32,31.3,32.3,37.2^,34.2^,33.9^,32.5\n,-6.9,-5.8,-6.1,-4.5,-5.5,-5.8,-6\n\"Income (median; $10,000s)\",6.6,2.7^,4.2^,12.1^,7.8^,6.7,4.6^\nHome Language Non-English,0.04,0.94^,0.87^,0.87^,0.63^,0.50^,0.80^\nChild Birth Weight,,,,,,,\nNormal Birth Weight,0.93,0.94,0.95,0.96^,0.92,0.92,0.94\nModerately Low Birth Weight,0.06,0.05,0.04*,0.03*^,0.07*,0.06*,0.05\nVery Low Birth Weight,0.01,0.01,,,,,0.01\nMother's Age at Migration (mean) (Foreign-born Mothers Only),N/A,18.5,18.6,24.2,19.5,19.6,19\n,,-7.2,-8,-7.6,-9,-9.8,-8.2\nLives in Urban Area,0.65,0.85^,0.96^,0.94^,0.90^,0.87^,0.88^\nPartner Employed (Among Mothers with a Partner),0.93,0.95,0.96,0.94,0.93,0.95,0.95\nMother's Employment Status,,,,,,,\nMother Not Employed,0.38,0.60^,0.39,0.33,0.44,0.43,0.50^\nMother Works Part-time,0.21,0.10^,0.17,0.15^,0.16^,0.2,0.14^\nMother Works Full-time,0.4,0.30^,0.44,0.53^,0.4,0.37,0.36^\nNon-Standard Work,0.26,0.26,0.23,0.11^,0.23,0.24,0.24\nMother's Health is Fair or Poor,0.09,0.18^,0.18^,0.04^,0.06^,0.03^,0.13^\nMother is Depressed,0.19,0.18,0.17,0.2,0.2,0.16,0.18\nOverall Relationship Quality (mean) (Among Mothers with a Partner),3.2,3.1,3.1,3.0^,3.1^,3.2,3.1^\n,-0.4,-0.5,-0.5,-0.4,-0.4,-0.5,-0.5\nTakes Child to Religious Services >= A Few Times per Month,0.58,0.69^,0.63,0.29^,0.67^,0.62,0.65^\nFood Insecurity,0.09,0.16^,0.07,0.02^,0.06,0.07,0.11\nNeighborhood is Fairly or Very Unsafe,0.06,0.12^,0.11,0.02^,0.03,0.05,0.09^");
}


