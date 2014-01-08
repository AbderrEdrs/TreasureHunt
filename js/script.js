
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


application = {};

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
	ttt=labelText;

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
	var textField=domHelp.addElement(parent,"input",this.inputType);
	if (parameters.hint)
		textField.setAttribute("placeholder",parameters.hint);
	textField.setAttribute('class',"form-control")
	this.__defineGetter__("hint", function () {return textField.getAttribute("placeholder");});
	this.__defineSetter__("hint", function (value) {textField.setAttribute("placeholder",value);});
}

// Row

application.Row = function (_screen, _name, _parent, parameters) {
	if (!_screen) 
		return;
	var parent = _parent;
	var screen = _screen;
	var name=_name;
	
	var newLine=domHelp.addElement(parent,"tr");

	var td_name=domHelp.addElement(newLine,"td");
	var labelTextName=domHelp.addText(td_name,(parameters.hunt_name?parameters.hunt_name:""));

	var td_nb_questions=domHelp.addElement(newLine,"td");
	var labelText=domHelp.addText(td_nb_questions,(parameters.nb_questions?parameters.nb_questions:""));
	
	var td_action=domHelp.addElement(newLine,"td");

	parameters.name=name;
	var textField=this.createActualField(newLine, parameters);
		
	this.__defineGetter__("td_name", function () {return labelTextName.data;});
	this.__defineSetter__("td_name", function (value) {labelTextName.data=value;});
	this.__defineGetter__("td_nb_questions", function () {return td_nb_questions.data;});
	this.__defineSetter__("td_nb_questions", function (value) {td_nb_questions.data=value;});
	this.__defineGetter__("name", function () {return name;});
	this.__defineSetter__("name", function (newName) {delete screen.fields[name]; screen.fields[newName]=this; name=newName;});

}

application.Row.prototype = {
	
}

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
			screen.show_div_create_hunt();
		}}, false);
		this.allElements[name]= new_hunt_btn;
	},
	addRow : function (name, parameters) {
		this.allElements[name]=new application.Row(this, name, this.body,parameters);
	},
	addButtonAction : function (name, label) {
		var class_style = "btn btn-success";
		this.allElements[name]= new application.Button(this, name, this.header, label, class_style);
	},
	show_div_create_hunt: function (){
		var textField = new application.TextField(this, 'hunt', this.div_create_hunt,{ label : "Nom du hunt :", hint : "Nom du hunt à indiquer" });
		var buttonCreate = new application.Button(this, 'createHunt', this.div_create_hunt, "Créer", "btn btn-success");
		var buttonCancel = new application.Button(this, 'cancel', this.div_create_hunt, "Annuler", "btn btn-danger");

		buttonCreate.getButton().addEventListener('click',{
			handleEvent :	function(){
				var hunt = new application.TreasureHunt(this.value);
				hunt.persist();
				show_div_add_question(hunt);
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
		resetScreen();

		var input_question = new application.Input(document.querySelector('#ecran'), '');
		var input_code = new application.Input(document.querySelector('#ecran'), '');
		var button_add = new application.Button(document.querySelector('#ecran'), 'Ajouter');

		button_add.getComponent().addEventListener('click',
				{
			handleEvent :	function()
			{
				var question = new application.Question(this.input_question.value, this.input_code.value);
				this.hunt.addQuestion(question);

				generateECRAN_addQuestion(this.hunt);
			},
			input_question : input_question.getComponent(),
			input_code : input_code.getComponent(),
			hunt : hunt
				},
				false);
		this.div_create_hunt.style.display = "block";
	}

}


window.onload = function () {
	screen=new application.Screen();
	screen.addTitle("Treasure Hunt");
	screen.addButtonCreateHunt ("showCreatHunt", "Créer un nouveau Hunt");

}

