
/* Application réalisé par 
 * 		Abderrahime EL IDRISSI
 *		Stéfan Dochez
 */


// domHelp

domHelp = {
	addElement : function (parent,tagName) {
		var tag=document.createElement(tagName);
		parent.appendChild(tag);
		for (var i=2;i<arguments.length;i+=2)
			tag.setAttribute(arguments[i],arguments[i+1]);
		return tag;
	},
	addText : function (tag, text) {
		var node=document.createTextNode(text);
		tag.appendChild(node);
		return node;
	}
}

var database,hunts= [];
application = {};

// base de donnée

application.Database =	function()
{
	var  database = openDatabase('TH', '1.0', 'Treasure Hunt', 2000000);
	this.init =	function(){
		database.transaction(function(t){t.executeSql('CREATE TABLE IF NOT EXISTS hunt(id INTEGER PRIMARY KEY AUTOINCREMENT, name)');});
		database.transaction(function(t){t.executeSql('CREATE TABLE IF NOT EXISTS question(id INTEGER PRIMARY KEY AUTOINCREMENT, id_hunt, question, code)');});
	};
	this.reset = function(){
		database.transaction(function(tx){tx.executeSql('DROP TABLE question');});
		database.transaction(function(tx){tx.executeSql('DROP TABLE hunt');});
	};
	this.getdatabase = function(){return database;};
};

// Button

application.Button = function (_screen, _name, _parent, _label, _class) {
	if (!_screen) 
		return;
	var parent = _parent;
	var screen = _screen;
	var name=_name;
	var label=_label
	var class_style=_class;

	var button=domHelp.addElement(parent,"button");
	var labelNode=domHelp.addText(button,label);
	
	if(class_style)
		button.setAttribute('class',class_style);

	button.style.float = 'right';
	
	this.getButton = function(){return button;}
		
	this.__defineGetter__("label", function () {return labelNode.data;});
	this.__defineSetter__("label", function (value) {labelNode.data=value;});
	this.__defineGetter__("name", function () {return name;});
	this.__defineSetter__("name", function (newName) {delete screen.allElements[name]; screen.allElements[newName]=this; name=newName;});

}

// FIELD

application.Field = function (_screen, _name, _parent, parameters) {
	if (!_screen) 
		return;
	var parent = _parent;
	var screen = _screen;
	var name=_name;
	
	var newLine=domHelp.addElement(parent,"p");

	var label=domHelp.addElement(newLine,"span");
	var labelText=domHelp.addText(label,(parameters.label?parameters.label:""));

	parameters.name=name;
	var ele=this.createActualField(newLine, parameters);
	
	this.getElemet = function(){return ele;}
	
	this.__defineGetter__("label", function () {return labelText.data;});
	this.__defineSetter__("label", function (value) {labelText.data=value;});
	this.__defineGetter__("name", function () {return name;});
	this.__defineSetter__("name", function (newName) {delete screen.fields[name]; screen.fields[newName]=this; name=newName;});

}

application.Field.prototype = {
	
}

// TextField

application.TextField = function (_screen,_name, _parent, parameters) {
	application.Field.call(this,_screen, _name, _parent, parameters);
}
application.TextField.prototype = new application.Field();
application.TextField.prototype.inputType="text";
application.TextField.prototype.createActualField = function (parent, parameters) {
	var textField=domHelp.addElement(parent,"input","type",this.inputType,"value"," ");
	if (parameters.hint)
		textField.setAttribute("placeholder",parameters.hint);
	textField.setAttribute('class',"form-control");
	textField.setAttribute('name',parameters.name);
	this.__defineGetter__("hint", function () {return textField.getAttribute("placeholder");});
	this.__defineSetter__("hint", function (value) {textField.setAttribute("placeholder",value);});
}

// Row

application.Row = function (_screen, _name, _parent, parameters) {
	if (!_screen) 
		return;
	var parent= document.getElementsByTagName("tbody").item(0);
	var screen = _screen;
	var name=_name;
	var newLine=domHelp.addElement(parent,"tr");
	
	var td_number=domHelp.addElement(newLine,"td");
	var labelTextNumber=domHelp.addText(td_number,(parameters.hunt_id?parameters.hunt_id:""));

	var td_name=domHelp.addElement(newLine,"td");
	var labelTextName=domHelp.addText(td_name,(parameters.hunt_name?parameters.hunt_name:""));

	var td_nb_questions=domHelp.addElement(newLine,"td");
	var labelText=domHelp.addText(td_nb_questions,(parameters.nb_questions?parameters.nb_questions:""));
	
	var td_action=domHelp.addElement(newLine,"td");
	buttonAction = new application.Button(screen, "answerButton", td_action, "Répondre", "btn btn-success");
	buttonAction.getButton().addEventListener('click',{
		id : parameters.hunt_id,
		handleEvent :	function(){	
			var ws = new application.Database();
			var db = ws.getdatabase();
			db.readTransaction(function(tx){
				tx.executeSql('SELECT * FROM hunt INNER JOIN question ON hunt.id = question.id_hunt where hunt.id = '+this.id, [], function (tx, results) {
						// var screen = new application.Screen();
						// screen.cleanShowDiv();
						console.log(results.rows);

						screen.show_div_answer_question(results.rows.item(0));
						screen.div_create_hunt.style.display = "block";
				});  	
			});
		}},
		false);
	
	this.__defineGetter__("td_name", function () {return labelTextName.data;});
	this.__defineSetter__("td_name", function (value) {labelTextName.data=value;});
	this.__defineGetter__("td_nb_questions", function () {return td_nb_questions.data;});
	this.__defineSetter__("td_nb_questions", function (value) {td_nb_questions.data=value;});
	this.__defineGetter__("name", function () {return name;});
	this.__defineSetter__("name", function (newName) {delete screen.fields[name]; screen.fields[newName]=this; name=newName;});

}

application.Row.prototype = {
	
}

// Questions

application.Question =	function(_question, _code)
{
	var question = _question;
	var code = _code;

	this.__defineGetter__('question', function(){return question;});
	this.__defineGetter__('code', function(){return code;});

	this.checkAnswer =	function(answer)
	{
		if(code == answer)
			return true;
		else
			return false;
	};
};

// TreasureHunt

application.TreasureHunt =	function(_name)
{
	var id;
	var name = _name;
	var i = 0;
	var questions = [];

	this.__defineGetter__('id', function(){return id;});
	this.__defineGetter__('name', function(){return name;});
	this.__defineGetter__('next',	function()
			{
		if (i < questions.length)
			return questions[i++];

		i = 0;
		return null;
			});

	this.persist =	function()
	{
		database.getdatabase().transaction(function(t){t.executeSql('INSERT INTO hunt(name) VALUES ("' + name + '")');});
		database.getdatabase().readTransaction(function(t){t.executeSql('SELECT max(id) as id FROM hunt', [], function(t, data){id = data.rows.item(0).id})});
	};

	this.getQuestion =	function(i)
	{
		if (i < questions.length)
			return questions[i];

		return null;
	};	

	this.addQuestion =	function(question)
	{
		questions.push(question);
		database.getdatabase().transaction(function(t){t.executeSql('INSERT INTO question(id_hunt, question, code) VALUES (' + id + ', "' + question.question + '", "' + question.code + '")');});
	};
};
// SCREEN

application.Screen = function () {
	this.body = document.getElementsByTagName("body").item(0);
	this.header = document.getElementsByTagName("header").item(0);
	this.tbody = document.getElementsByTagName("tbody").item(0);
	this.div_create_hunt = document.getElementById('create_hunt');
	this.cleanShowDiv = function(){
		for (var i=0;this.div_create_hunt.childNodes.length;i++) 
			this.div_create_hunt.removeChild(this.div_create_hunt.childNodes.item(0));
	}
		
	this.allElements={};
}

application.Screen.prototype = {
	addTitle : function (_titleText) {
		this.titleNode=domHelp.addElement(this.header,"h2");
		this.titleTextNode=domHelp.addText(this.titleNode,_titleText);
	},
	addButtonCreateHunt : function (name, label) {
		var class_style = "btn btn-primary btn-lg";
		var new_hunt_btn = new application.Button(this, name, this.header, label, class_style);
		new_hunt_btn.getButton().addEventListener('click', {handleEvent : function(){
			screen = new application.Screen();
			screen.cleanShowDiv();
			screen.show_div_create_hunt();
		}}, false);
		this.allElements[name]= new_hunt_btn;
	},
	addRow : function (name, parameters) {
		this.allElements[name]=new application.Row(this, name, this.body,parameters);
	},
	addButtonAction : function (name, label) {
		var class_style = "btn btn-success";
		this.allElements[name]= new application.Button(this, name, this.tbody, label, class_style);
	},
	show_div_create_hunt: function (){
		var textField = new application.TextField(this, 'hunt', this.div_create_hunt,{ label : "Nom du hunt :", hint : "Nom du hunt à indiquer" });
		var buttonCreate = new application.Button(this, 'createHunt', this.div_create_hunt, "Créer", "btn btn-success");
		var buttonCancel = new application.Button(this, 'cancel', this.div_create_hunt, "Annuler", "btn btn-danger");

		buttonCreate.getButton().addEventListener('click',{
			textFields : textField,
			handleEvent :	function(){
				var hunt = new application.TreasureHunt(this.textFields.value);
				hunt.persist();
				screen = new application.Screen();
				screen.cleanShowDiv();
				screen.show_div_add_question(hunt);
			},
			input : textField.getElemet()
		},
		false);

		buttonCancel.getButton().addEventListener('click',{
			handleEvent :	function(){
				screen = new application.Screen();
				screen.cleanShowDiv();
				screen.div_create_hunt.style.display = "none";
			}},
		false);
		this.div_create_hunt.style.display = "block";
	},
	show_div_add_question: function (hunt){
		
		var textFieldQuestion = new application.TextField(this, 'question', this.div_create_hunt,{ label : "Question :", hint : "Question" });
		var textFieldCode = new application.TextField(this, 'code', this.div_create_hunt,{ label : "Code :", hint : "Code" });
		var buttonCreateQustion = new application.Button(this, 'createQuestion', this.div_create_hunt, "Terminer", "btn btn-success");
		var buttonCreateOther = new application.Button(this, 'createQuestionOther', this.div_create_hunt, "Ajouter une question", "btn btn-primary");

		buttonCreateQustion.getButton().addEventListener('click',{
			textFieldQuestions : textFieldQuestion,
			textFieldCodes : textFieldCode,
			hunt : hunt,
			handleEvent :	function(){
				var question = new application.Question(
					this.textFieldQuestions.value, 
					this.textFieldCodes.value);
				
				this.hunt.addQuestion(question);
				screen = new application.Screen();
				screen.cleanShowDiv();
				screen.div_create_hunt.style.display = "none";
			}},
			false);

		buttonCreateOther.getButton().addEventListener('click',{
			hunt:hunt,
			handleEvent :	function(){
				screen = new application.Screen();
				screen.cleanShowDiv();
				screen.show_div_add_question(this.hunt);
			}},
		false);
	},
	show_div_answer_question: function(hunt){
		//var question = hunt.next;
		var textFieldQuestion = new application.TextField(this, 'answerQuestion', this.div_create_hunt,{ label : "Question :", hint : "Question" });
		var textFieldCode = new application.TextField(this, 'answerCode', this.div_create_hunt,{ label : "Code :", hint : "Code" });
		var buttonValidateQustion = new application.Button(this, 'validate', this.div_create_hunt, "Valider", "btn btn-success");

		buttonValidateQustion.getButton().addEventListener('click',{
			//code : question.code,
			textFieldCodes : textFieldCode,
			hunt : hunt,
			handleEvent :	function()
			{
				if (this.textFieldCodes.value == 'this.code'){
					screen = new application.Screen();
					screen.cleanShowDiv();
					screen.show_div_answer_question(this.hunt);
				}else
					alert("Vous réponse est incorrecte!");
			}},
			false);
	},
	create_list_hunts: function (){
		var db = database.getdatabase()
		db.readTransaction(function(tx){
			tx.executeSql('SELECT *, COUNT(question.id) AS nb_questions FROM hunt INNER JOIN question ON hunt.id = question.id_hunt GROUP BY hunt.id', [], function (tx, results) {
			  	var len = results.rows.length, i;
				for (i = 0; i < len; i++) {
					var row = new application.Row(this, 'hunt', this.tbody, {hunt_id:results.rows.item(i).id,hunt_name:results.rows.item(i).name,nb_questions:results.rows.item(i).nb_questions});
			  	}
			});  	
		});
	}

}


window.onload = function () {
	database = new application.Database();
	database.init();
	screen=new application.Screen();
	screen.addTitle("Treasure Hunt");
	screen.addButtonCreateHunt ("showCreatHunt", "Créer un nouveau Hunt");
	screen.create_list_hunts();

}

