function dragstart_property_handler(ev)
{
	// Add the target element's id to the data transfer object
	ev.dataTransfer.setData("application/hexfield-property", ev.target.outerHTML);
	ev.dataTransfer.dropEffect = "copy";
	builder_globals.dragged_property = null;
}

function dragstart_move_property_handler(ev)
{
	// add any text area values to their elements as attributes
	const tas = ev.target.querySelectorAll("textarea");
	tas.forEach(ta => ta.innerHTML = ta.value);
	
	// for custom elements, copy input too
	const inp = ev.target.querySelector("input.builder-custom-type");
	if (inp)
		inp.setAttribute('value', inp.value);
	
	console.log('start', ev.target, tas);
	//ev.target.firstElementChild.innerHTML = ev.target.firstElementChild.value;
	ev.dataTransfer.setData("application/hexfield-property", ev.target.outerHTML);
	ev.dataTransfer.dropEffect = "move";
	builder_globals.dragged_property = ev.target;
}

function drop_property_handler(ev) {

	console.log(ev);

 if (!drop_property_ok(ev)) return;
 ev.preventDefault();
 // Get the id of the target and add the moved element to the target's DOM
 const data = ev.dataTransfer.getData("application/hexfield-property");
 //ev.target.style.backgroundColor = '';
 const temp = document.createElement("div");


	 temp.innerHTML = data;
	 temp.firstElementChild.setAttribute("ondragstart", "dragstart_move_property_handler(event)");
 
	ev.target.parentElement.parentElement.style.filter = '';
	
	const attr_cont = ev.target.parentElement.querySelector('.builder-property-container');
	attr_cont.append(temp.firstElementChild);
 
	 if (builder_globals.dragged_property && !ev.shiftKey)
		builder_globals.dragged_property.remove();
	 
	 renderCode();
	 render();

}

function dragover_property_handler(ev) {
 ev.preventDefault();
 //if (builder_globals.dragged)
	 ev.dataTransfer.dropEffect = "copy";
}


function onPropertyDragLeave(event)
{
	event.target.style.background = '';
	//--//event.target.parentElement.style.borderColor = '';
	
		event.target.parentElement.parentElement.style.filter = '';
	//event.target.parentElement.style.removeProperty('--set-color');
		event.target.style.removeProperty('--property-dropzone-color'); //'#1f904e';
}

function onPropertyDragEnter(event)
{
	event.preventDefault();
	// Set the dropEffect to move
	//event.dataTransfer.dropEffect = 'linkMove';
	if (drop_property_ok(event))
	{
		event.target.parentElement.parentElement.style.filter = 'brightness(75%)';
		//event.target.parentElement.style.setProperty('--set-color', '#1f904e');
		//--//event.target.parentElement.style.borderColor = '#1f904e';
		event.target.style.setProperty('--property-dropzone-color', 'mediumseagreen'); //'#1f904e';
	}
}


function drop_property_ok(event)
{
	if (builder_globals.dragged_property)
		console.log('dpo', builder_globals.dragged_property.parentElement.parentElement, event.target.parentElement)
	return event.dataTransfer.getData("application/hexfield-property")
				&& (event.shiftKey
					|| !builder_globals.dragged_property
					|| (builder_globals.dragged_property
						&& builder_globals.dragged_property.parentElement.parentElement != event.target.parentElement));
}