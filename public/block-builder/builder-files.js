import { parse } from "parse5";

export function load_code(code_str)
{
	/* Explanation of RegEx:
		<						match opening <
		(\/?) 			match a / if present (group 1)
		([-\.\w]+)	match tag name (group 2)
		(\s*)				match any space after the tag name (group 3) (capturing to enable exact re-creating of tag)
		(						group 4: all attributes (and space)
		(?:					non-capturing group: a single attribute, w/ any space after
		[...]+			match attribute name (negated set based on specs)
		(?:					non-capturing group: the value part of the attribute, incl. equals)
		\s*=\s*			match = sign (with space allowed around it)
		(?:					non-capturing group (needed to | value with or without quotation marks)
		(["'])			match quotation mark (group 5)
		.*?					match attribute value (zero-or-more instances of any character, non-greedy)
		\5					match closing quotation mark
		|						or (allowing values with or without quotes)
		[...]+			match attribute value (negated set based on specs)
		))?					match non-capturing group (the value part of the attribute...) if present
		\s*					match any/all space after the attribute
		)*					match non-capturing group (a single attribute w/ any space after), zero-or-more times
		)						close of group 4 (everything after tag name and space, i.e. all attributes)
		>						match closing >

		WHY??
			To properly handle a tag like: <img alt="<this is allowed>">

			Thanks to:
		  https://stackoverflow.com/questions/925994/what-characters-are-allowed-in-an-html-attribute-name
			https://stackoverflow.com/questions/5320177/what-values-can-i-put-in-an-html-attribute-value

			Sp'excerpt:
			https://html.spec.whatwg.org/multipage/syntax.html#syntax-attributes

			"Attributes have a name and a value. Attribute names must consist of one or more characters other than
			controls, U+0020 SPACE, U+0022 ("), U+0027 ('), U+003E (>), U+002F (/), U+003D (=), and noncharacters.
			In the HTML syntax, attribute names, even those for foreign elements, may be written with any mix of
			ASCII lower and ASCII upper alphas.

			"Attribute values are a mixture of text and character references, except with the additional restriction 
			that the text cannot contain an ambiguous ampersand.
			...
			"Unquoted attribute value syntax

			"The attribute name, followed by zero or more ASCII whitespace, followed by a single
			U+003D EQUALS SIGN character, followed by zero or more ASCII whitespace, followed by
			the attribute value, which, in addition to the requirements given above for attribute values,
			must not contain any literal ASCII whitespace, any U+0022 QUOTATION MARK characters ("),
			U+0027 APOSTROPHE characters ('), U+003D EQUALS SIGN characters (=),
			U+003C LESS-THAN SIGN characters (<), U+003E GREATER-THAN SIGN characters (>), or
			U+0060 GRAVE ACCENT characters (`), and must not be the empty string.
			...
			"[CHAR (" or ')]-quoted attribute value syntax

    	"The attribute name, followed by zero or more ASCII whitespace, followed by
			a single U+003D EQUALS SIGN character, followed by zero or more ASCII whitespace, followed by
			a single [CHAR], followed by the attribute value, which, in addition to the requirements
			given above for attribute values, must not contain any literal [CHAR], and finally
			followed by a second single [CHAR]."
	*/

	const re = /<(\/?)([-\.\w]+)(\s*)((?:[^\s"'>\/=]+(?:\s*=\s*(?:(["']).*?\5|[^\s"'=<>`]+))?\s*)*)>/g;
	code_str = code_str.replaceAll(re,
		(_, ending_tag, tag_name, space, attributes) =>
		{
			if  (ending_tag == '/')
				return `</div>`;
			else
			{
				var tn;
				if (builder_globals.empty_elements.includes(tag_name))
					tn = 'br';
				else
					tn = 'div';
				return `<${tn} data-converting-type='${tag_name}'${space+attributes}>`;
			}
		}); // "<$1div data-converting-type='$2'$3>");
		
	const div = document.createElement('div');
	
	/*
	code_str = replace_all(code_str, '!DOCTYPE html', 'doctype');
	code_str = replace_all(code_str, 'html', 'html-tag');
	code_str = replace_all(code_str, 'head', 'head-tag');
	code_str = replace_all(code_str, 'body', 'body-tag');
	*/
	
	div.innerHTML = code_str;
	
	const code = document.querySelector('#code');
	code.innerHTML = '';
	
	// better to use a template with a dropzone?
	const botdz = document.createElement('div');
	botdz.setAttribute('class', 'dropzone');
	code.append(botdz);
	
	// TODO get/add doctype
	
	for (const el of div.childNodes)
	{
		const loaded = load_element(el);
		
		if (loaded)
		{
			code.append(loaded);
		
			const botdz = document.createElement('div');
			botdz.setAttribute('class', 'dropzone');
			code.append(botdz);
		}
	}
	
	dropify(code);
}

export function load_element(el)
{
	var type;
	if (el.getAttribute)
	{
		type = el.getAttribute('data-converting-type'); //.tagName.toLowerCase();
	}
	
	/*
	if (type == 'doctype') type = '!DOCTYPE html';
	if (type == 'html-tag') type = 'html';
	if (type == 'head-tag') type = 'head';
	if (type == 'body-tag') type = 'body';
	*/
	
	if (type == "!DOCTYPE") type = "!DOCTYPE html"; // I am sorry for this if statement :/
	
	// TODO change document to the bank div
	const templ = document.querySelector(`[data-type='${type}']`);
	var ne;
	
	if (el.nodeType == 3) // text node
	{
		// if empty text node, return null to skip
		const txt = el.textContent.trim();
		
		if ( !txt ) return null;
		
		// TODO change document to the bank div
		const txt_templ = document.querySelector(`[data-type='[text]']`);
		ne = txt_templ.cloneNode(true);
	
		ne.setAttribute("ondragstart", "dragstart_move_handler(event)");
		const ta = ne.querySelector('textarea');
		ta.innerHTML = txt;
		// this line is apparently necessary, even though it shouldn't be
		ta.value = ta.innerHTML;
	}
	else if (builder_globals.text_elements.includes(type))
	{
		ne = templ.cloneNode(true);
		addAttributes(el, ne);
		
		ne.setAttribute("ondragstart", "dragstart_move_handler(event)");
		const ta = ne.querySelector('textarea');
		el.innerHTML = el.innerHTML.trim();
		ta.innerHTML = el.innerHTML;
		// this line might be necessary, even though it shouldn't be
		ta.value = ta.innerHTML;
	}
	else if (builder_globals.known_elements.includes(type))
	{
		ne = templ.cloneNode(true);
		addAttributes(el, ne);
		ne.setAttribute("ondragstart", "dragstart_move_handler(event)");
	
		for (const chel of el.childNodes)
		{
			const loaded = load_element(chel);
		
			if (loaded)
			{
				ne.append(loaded);
			
				const botdz = document.createElement('div');
				botdz.setAttribute('class', 'dropzone');
				ne.append(botdz);
			}
		}
	}
	else if (el.nodeType == 1)
	{
		// TODO change document to the bank div
		var check_empty = builder_globals.empty_elements.includes(type);
		
		const custom_templ = document.querySelector(`[data-type="${check_empty ? '[custom-empty]' : '[custom]'}"]`);
		ne = custom_templ.cloneNode(true);
		addAttributes(el, ne);
		ne.setAttribute("ondragstart", "dragstart_move_handler(event)");
		
		ne.querySelector('.builder-custom-type').setAttribute('value', type);
		
		if (!check_empty)
		{
			for (const chel of el.childNodes)
			{
				const loaded = load_element(chel);
		
				if (loaded)
				{
					ne.append(loaded);
			
					const botdz = document.createElement('div');
					botdz.setAttribute('class', 'dropzone');
					ne.append(botdz);
				}
			}
		}
	}

	
	return ne;
}

export function addAttributes(source, dest)
{
	//console.log("aa", source);
	if (!dest.hasAttribute("data-no-attributes"))
	{
		/*
<div class="builder-attribute-set">
<div class="builder-attribute-container"></div>
<div class="builder-attribute-dropzone" ondragenter="onAttributeDragEnter(event)" ondragleave="onAttributeDragLeave(event)" ondrop="drop_attribute_handler(event)" ondragover="dragover_attribute_handler(event)"></div>
</div>
		*/
		
		
		const templates = document.querySelector('#templates');
	
		const wrapper = templates.querySelector('.builder-attribute-set').cloneNode(true);
		dest.prepend(wrapper);
		
		const listContainer = wrapper.firstElementChild; // simpler but more brittle than querySelector('.builder-attribute-container').cloneNode(true);
		
		for (var i = 0; i < source.attributes.length; i++)
		{
			const attr = source.attributes[i];
			
			if (attr.name == 'data-converting-type') continue;
			
			if (builder_globals.known_attributes.includes(attr.name))
			{
				// TODO change document to the bank div (or make templates)
				const new_attr = document.querySelector(`[data-attribute-name='${attr.name}']`).cloneNode(true);
				
				if (attr.name == 'style')
				{
					const prop_list = new_attr.querySelector('.builder-property-container');
					
					// /([\w-]+):\s*([^;]+);?/gm
					
					
					
					
					////////////
					
					const cssdiv = document.createElement('div');
					cssdiv.style.cssText = attr.value;
					
					/*const cssdoc = document.implementation.createHTMLDocument();
					cssdoc.body.append(cssdiv);*/
			
					console.log('r s', cssdiv.style);
					
					for (var css_i = 0; css_i < cssdiv.style.length; css_i++)
					{
						const name = cssdiv.style[css_i];
						const value = cssdiv.style.getPropertyValue(name);
						
						const templ_name = builder_globals.known_properties.includes(name) ? name : '[custom]';
						const new_prop = document.querySelector(`[data-property-name='${templ_name}']`).cloneNode(true);
						
						if (templ_name == '[custom]')
							new_prop.querySelector('.builder-property-name').value = name;
						
						new_prop.querySelector('.builder-property-value').value = value;
						
						prop_list.append(new_prop);
					}
				}
				else
					new_attr.querySelector('.builder-attr-value').value = attr.value;
				
				listContainer.append(new_attr);
			}
			else
			{
				const new_attr = document.querySelector(`[data-attribute-name='[custom]']`).cloneNode(true);
				new_attr.querySelector('.builder-attr-name').value = attr.name;
				new_attr.querySelector('.builder-attr-value').value = attr.value;
				
				listContainer.append(new_attr);
			}
		}
	}
}
