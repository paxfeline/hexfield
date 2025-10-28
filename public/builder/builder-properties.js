export function update_value(event)
{
	event.target.setAttribute('value', event.target.value);
}

builder_globals.handlers.update_value = update_value;

export function dragstart_property_handler(ev)
{
	const code = document.querySelector("#code");
	if (code.contains(ev.target))
	{
		// add any text area values to their elements as attributes
		const tas = ev.target.querySelectorAll("textarea");
		tas.forEach(ta => ta.innerHTML = ta.value);
		
		// for custom elements, copy input too
		const inp = ev.target.querySelector("input.builder-custom-type");
		if (inp)
			inp.setAttribute('value', inp.value);
		
		console.log('start p m', ev.target, tas);
		//ev.target.firstElementChild.innerHTML = ev.target.firstElementChild.value;
		ev.dataTransfer.setData("application/hexfield-property", ev.target.outerHTML);
		ev.dataTransfer.dropEffect = "move";
		builder_globals.dragged_property = ev.target;
	}
	else
	{
		console.log('dsp');
		// Add the target element's id to the data transfer object
		ev.dataTransfer.setData("application/hexfield-property", ev.target.outerHTML);
		ev.dataTransfer.dropEffect = "copy";
		builder_globals.dragged_property = null;
	}
	
	ev.stopPropagation();
}

builder_globals.handlers.dragstart_property = dragstart_property_handler;

export function drop_property_handler(ev)
{
	console.log('dph', ev);

	if (!drop_property_ok(ev)) return;
	ev.preventDefault();
	// Get the id of the target and add the moved element to the target's DOM
	const data = ev.dataTransfer.getData("application/hexfield-property");
	//ev.target.style.backgroundColor = '';
	const temp = document.createElement("div");


	temp.innerHTML = data;
	//temp.firstElementChild.setAttribute("ondragstart", "builder_globals.handlers.dragstart_move_property(event)");
 
	ev.target.parentElement.style.filter = '';
	ev.target.style.removeProperty('--property-dropzone-color');

	const attr_cont = ev.target.parentElement.querySelector('.builder-property-container');
	attr_cont.append(temp.firstElementChild);
 
	if (builder_globals.dragged_property && !ev.shiftKey)
		builder_globals.dragged_property.remove();
	 
	 builder_globals.dragged_property = null;
}

builder_globals.handlers.drop_property = drop_property_handler;

export function dragover_property_handler(ev) {
	if (ev.dataTransfer.getData("application/hexfield-property")
		&& drop_property_ok(ev))
	{
		if (builder_globals.dragged_property && !ev.shiftKey)
			ev.dataTransfer.dropEffect = "move";
		else
			ev.dataTransfer.dropEffect = "copy";
			
		ev.target.parentElement.style.filter = 'brightness(75%)';
		ev.target.style.setProperty('--property-dropzone-color', 'mediumseagreen'); //'#1f904e';
	}
	else
	{
		ev.target.parentElement.style.filter = '';
		ev.target.style.removeProperty('--property-dropzone-color');
	}
	
	ev.preventDefault();
}

builder_globals.handlers.dragover_property = dragover_property_handler;

export function onPropertyDragLeave(ev)
{
	ev.target.parentElement.style.filter = '';
	ev.target.style.removeProperty('--property-dropzone-color');
}

builder_globals.handlers.dragleave_property = onPropertyDragLeave;

export function onPropertyDragEnter(event)
{
}

builder_globals.handlers.dragenter_property = onPropertyDragEnter;

// TODO: 86

export function drop_property_ok(event)
{
	//if (builder_globals.dragged_property)
	//	console.log('dpo', builder_globals.dragged_property.parentElement.parentElement, event.target.parentElement)
	return event.dataTransfer.getData("application/hexfield-property")
				&& (event.shiftKey
					|| !builder_globals.dragged_property
					|| (builder_globals.dragged_property
						&& builder_globals.dragged_property.parentElement.parentElement != event.target.parentElement));
}