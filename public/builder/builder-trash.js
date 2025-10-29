function trash_drop_ok()
{
	const thing =
		builder_globals.dragged ||
		builder_globals.dragged_attribute ||
		builder_globals.dragged_property
	return thing && document.querySelector("#code").contains(thing);
}

export function drop_trash_handler(ev) {
	if (trash_drop_ok())
	{
		 ev.preventDefault();
		 
		 if (builder_globals.dragged)
		 {
			// remove trailing dropzone
			builder_globals.dragged.nextElementSibling.remove();
			// remove element
			builder_globals.dragged.remove();
			builder_globals.dragged = null;
 		 }
		 else if (builder_globals.dragged_attribute)
		 {
			builder_globals.dragged_attribute.remove();
			builder_globals.dragged_attribute = null;
		 }
		 else if (builder_globals.dragged_property)
		 {
			builder_globals.dragged_property.remove();
			builder_globals.dragged_property = null;
		 }
	 }
 
	const bank = ev.currentTarget;
	bank.style.background = '';
	bank.style.borderColor = '';
	
	builder_globals.trash_in_out_count = 0;
}

builder_globals.handlers.drop_trash = drop_trash_handler;

export function dragover_trash_handler(ev) {
//console.log('dot', ev);
 //if (builder_globals.dragged)
 {
	 
	 if (!trash_drop_ok()) return;
	 
	 // The drag enters a valid drop target:
	 // the drop target cancels its dragover event
	 // to indicate that it is a valid drop target
	 ev.preventDefault();
	 // TODO: something else?
	 ev.dataTransfer.dropEffect = "move";
	}
}

builder_globals.handlers.dragover_trash = dragover_trash_handler;

// TODO: fix the need for this variable by stopping evebt propagation
// if possible
builder_globals.trash_in_out_count = 0;

export function onTrashDragLeave(ev)
{
	if (!trash_drop_ok()) return;
	
	builder_globals.trash_in_out_count--;
	console.log('trash leave', ev.eventPhase, "(", builder_globals.trash_in_out_count, ev.currentTarget);
	
	if (builder_globals.trash_in_out_count == 0)
	{
		const bank = ev.currentTarget;
		bank.style.background = '';
		bank.style.borderColor = '';
	}
	
	//ev.stopPropagation();
}

builder_globals.handlers.dragleave_trash = onTrashDragLeave;

export function onTrashDragEnter(ev)
{
	if (!trash_drop_ok()) return;
	
	builder_globals.trash_in_out_count++;
	console.log('trash enter', ev.eventPhase, "(", builder_globals.trash_in_out_count, ev.currentTarget);
	if (builder_globals.dragged || builder_globals.dragged_attribute)
	{
		ev.preventDefault();
		const bank = ev.currentTarget;
		bank.style.borderColor = 'darkred';
		bank.style.background = 'red';
	}
	//ev.stopPropagation();
}

builder_globals.handlers.dragenter_trash = onTrashDragEnter;