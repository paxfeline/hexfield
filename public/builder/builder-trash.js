export function drop_trash_handler(ev) {
	if (builder_globals.dragged
		|| builder_globals.dragged_attribute
		|| builder_globals.dragged_property )
	{
		 ev.preventDefault();
		 
		 if (builder_globals.dragged)
		 {
			builder_globals.dragged.remove();
			builder_globals.dragged = null;
 
			trim_dropzones(document.querySelector("#code").firstElementChild);
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
	
		renderCode();
		render();
	 }
 
	const bank = document.querySelector('#bank');
	bank.style.background = '';
	bank.style.borderColor = '';
	
	builder_globals.trash_in_out_count = 0;
}

export function dragover_trash_handler(ev) {
//console.log('dot', ev);
 //if (builder_globals.dragged)
 {
	 ev.preventDefault();
	 ev.dataTransfer.dropEffect = "move";
	}
}

builder_globals.trash_in_out_count = 0;

export function onTrashDragLeave(event)
{
	builder_globals.trash_in_out_count--;
	console.log('trash leave', builder_globals.trash_in_out_count);
	const bank = document.querySelector('#bank');
	if (builder_globals.trash_in_out_count == 0)
	{
		bank.style.background = '';
		bank.style.borderColor = '';
	}
}

export function onTrashDragEnter(event)
{
	builder_globals.trash_in_out_count++;
	console.log('trash enter', builder_globals.trash_in_out_count);
	if (builder_globals.dragged || builder_globals.dragged_attribute)
	{
		event.preventDefault();
		const bank = document.querySelector('#bank');
		bank.style.borderColor = 'darkred';
		bank.style.background = 'red';
	}
}