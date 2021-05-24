function drop_trash_handler(ev) {
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
	
	trash_in_out_count = 0;
}

function dragover_trash_handler(ev) {
//console.log('dot', ev);
 //if (builder_globals.dragged)
 {
	 ev.preventDefault();
	 ev.dataTransfer.dropEffect = "move";
	}
}

var trash_in_out_count = 0;

function onTrashDragLeave(event)
{
	trash_in_out_count--;
	console.log('trash leave', trash_in_out_count);
	const bank = document.querySelector('#bank');
	if (trash_in_out_count == 0)
	{
		bank.style.background = '';
		bank.style.borderColor = '';
	}
}

function onTrashDragEnter(event)
{
	trash_in_out_count++;
	console.log('trash enter', trash_in_out_count);
	if (builder_globals.dragged || builder_globals.dragged_attribute)
	{
		event.preventDefault();
		const bank = document.querySelector('#bank');
		bank.style.borderColor = 'darkred';
		bank.style.background = 'red';
	}
}