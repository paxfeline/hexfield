import { builder_create_dropzone } from "./builder-elements.js";
import * as mcp from "/hex/mcp.js";

export function load_code(code_str)
{
	/* Explanation of RegEx:
		<						match opening <
		(\/?) 			match a / if present (group 1)
		(!?					match a possible ! (for !DOCTYPE) at start of tag name (group 2 pt. 1)
		[-\.\w]+)		match tag name (group 2 pt. 2)
		(\s+				match any space after the tag name (group 3 begins)
		(?:						non-capturing group: a single attribute, w/ any space after
		[...]+					match attribute name (negated set based on specs)
		(?:							non-capturing group: the value part of the attribute, incl. equals)
		\s*=\s*						match = sign (with space allowed around it)
		(?:								non-capturing group (needed to | value with or without quotation marks)
		(["'])							match quotation mark (group 4)
		.*?									match attribute value (any # of instances of any character, non-greedy)
		\4									match closing quotation mark
		|										or (allowing values with or without quotes)
		[...]+							match attribute value (negated set based on specs)
		))?							match non-capturing group (the value part of the attribute...) if present
		\s*							match any/all space after the attribute
		)*						match non-capturing group (a single attribute w/ any space after), any # of times
		)						close of group 3 (everything after tag name and space, i.e. all attributes)
		\/?					consume possible XML-style trailing slash (self-closing tag)
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

	// TODO: for this parsing, take into account <script> (and other?) tags/elements.
	// So that if an HTML tag appears inside JavaScript code (e.g. in a string),
	// it will be ignored.
	// Arrrg but if a script element contains a string with the closing script tag...
	// I have to parse JS too???

	//const re = /<(\/?)([-\.\w]+)(\s+)((?:[^\s"'>\/=]+(?:\s*=\s*(?:(["']).*?\5|[^\s"'=<>`]+))?\s*)*)>/g;
	const re = /<(\/?)(!?[-\.\w]+)((?:\s+[^\t\s\/>"'=]+(?:\s*=\s*(?:(["']).*?\4|[^\t\s\/>"'=]+))?)*\s*)\/?>/g;
	code_str = code_str.replaceAll(re,
		(_, ending_tag, tag_name, attributes) =>
		{
			console.log("converting:", ending_tag, tag_name, attributes);
			if  (ending_tag == '/')
				return `</div>`;
			else
			{
				var tn;
				if (builder_globals.empty_elements.includes(tag_name.toLowerCase()))
					tn = 'br';
				else
					tn = 'div';
				return `<${tn} data-converting-type='${tag_name}'${attributes}>`;
			}
		}); // "<$1div data-converting-type='$2'$3>");
		
	const div = document.createElement('div');
	
	div.innerHTML = code_str;

	//mcp.fireEvent(mcp.events.builder_built, div.children); // wut?

	const code = document.createElement("div");
	
	// better to use a template with a dropzone?
	const botdz = builder_create_dropzone();
	code.append(botdz);
	
	// TODO get/add doctype
	
	for (const el of div.childNodes)
	{
		const loaded = load_element(el);
		
		if (loaded)
			code.append(...loaded);
	}

	return code;
}

builder_globals.load_code = load_code;

export function load_element(el)
{
	let type;
	if (el.getAttribute)
		type = el.getAttribute('data-converting-type');
	
	if (type?.toLowerCase() === "!doctype") type = "!doctype html";
	
	// TODO change document to the bank div
	//const templ = document.querySelector(`[data-type='${type}']`);
	let ne, dz;
	
	if (el.nodeType == 3) // text node
	{
		// if empty text node, return null to skip
		const txt = el.textContent.trim();
		
		if ( txt === '' ) return null;
		
		// TODO change document to the bank div
		//const txt_templ = document.querySelector(`[data-type='[text]']`);
		//ne = txt_templ.cloneNode(true);
		[ne, dz] = builder_globals.factories.element('[text]').children;
		
		let ta = ne.firstElementChild;
		ta.innerHTML = txt;
		// this line is apparently necessary, even though it shouldn't be
		// TODO: check ^
		ta.value = ta.innerHTML;
	}
	else if (builder_globals.text_elements.includes(type))
	{
		//ne = templ.cloneNode(true);
		[ne, dz] = builder_globals.factories.element(type).children;
		addAttributes(el, ne);
		
		const ta = ne.firstElementChild;
		// TODO: check this line I commentded out if shit goes south
		//el.innerHTML = el.innerHTML.trim();
		ta.innerHTML = el.innerHTML.trim();
		// this line might be necessary, even though it shouldn't be
		// TODO: again, check ^:
		ta.value = ta.innerHTML;
	}
	else if (builder_globals.known_elements.includes(type))
	{
		//ne = templ.cloneNode(true);
		[ne, dz] = builder_globals.factories.element(type).children;
		addAttributes(el, ne);
	
		for (const chel of el.childNodes)
		{
			const loaded = load_element(chel);
		
			if (loaded)
				ne.append(...loaded);
		}
	}
	else if (el.nodeType == 1)
	{
		// TODO change document to the bank div
		var check_empty = builder_globals.empty_elements.includes(type);
		
		//const custom_templ = document.querySelector(`[data-type="${check_empty ? '[custom-empty]' : '[custom]'}"]`);
		//ne = custom_templ.cloneNode(true);
		[ne, dz] = builder_globals.factories.element(check_empty ? '[custom-empty]' : '[custom]').children;
		addAttributes(el, ne);
		
		ne.querySelector('.builder-custom-type').setAttribute('value', type);
		
		if (!check_empty)
		{
			for (const chel of el.childNodes)
			{
				const loaded = load_element(chel);
		
				if (loaded)
					ne.append(...loaded);
			}
		}
	}

	return [ne, dz];
}

export function addAttributes(source, dest)
{
	//console.log("aa", source);
	//if (!dest.hasAttribute("data-no-attributes"))
	// chaning to not rely on these attributes
	if (!builder_globals.no_attributes.includes(dest.dataset.type))
	{
		//const templates = document.querySelector('#templates');
	
		//const wrapper = templates.querySelector('.builder-attribute-set').cloneNode(true);
		//dest.prepend(wrapper);
		
		//const listContainer = wrapper.firstElementChild; // simpler but more brittle than querySelector('.builder-attribute-container').cloneNode(true);

		const listContainer = dest.querySelector('.builder-attribute-container');

		for (var i = 0; i < source.attributes.length; i++)
		{
			const attr = source.attributes[i];
			
			if (attr.name == 'data-converting-type') continue;
			
			if (builder_globals.known_attributes.includes(attr.name))
			{
				// TODO change document to the bank div (or make templates)
				//const new_attr = document.querySelector(`[data-attribute-name='${attr.name}']`).cloneNode(true);
				const new_attr = builder_globals.factories.attribute(attr.name);

				if (attr.name == 'style')
				{
					const prop_list = new_attr.querySelector('.builder-property-container');
					
					const cssdiv = document.createElement('div');
					cssdiv.style.cssText = attr.value;
								
					console.log('r s', cssdiv.style);
					
					for (var css_i = 0; css_i < cssdiv.style.length; css_i++)
					{
						const name = cssdiv.style[css_i];
						const value = cssdiv.style.getPropertyValue(name);
						
						const prop_name = builder_globals.known_properties.includes(name) ? name : '[custom]';
						// const new_prop = document.querySelector(`[data-property-name='${templ_name}']`).cloneNode(true);
						const new_prop = builder_globals.factories.property(prop_name);
						
						if (prop_name == '[custom]')
							new_prop.querySelector('.builder-property-name').defaultValue = name;
						
						new_prop.querySelector('.builder-property-value').defaultValue = value;
						
						prop_list.append(new_prop);
					}
				}
				else
					new_attr.querySelector('.builder-attr-value').defaultValue = attr.value;
				
				listContainer.append(new_attr);
			}
			else
			{
				//const new_attr = document.querySelector(`[data-attribute-name='[custom]']`).cloneNode(true);
				const new_attr = builder_globals.factories.attribute('[custom]');
				new_attr.querySelector('.builder-attr-name').defaultValue = attr.name;
				new_attr.querySelector('.builder-attr-value').defaultValue = attr.value;
				
				listContainer.append(new_attr);
			}
		}
	}
}
