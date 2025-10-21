const cssdoc = document.implementation.createHTMLDocument();
					const style_el = document.createElement('style');
					style_el.innerHTML = attr.value;
					cssdoc.head.append(style_el);
					
					for (const styleSheet of cssdoc.styleSheets)
					{
						if (styleSheet.cssRules)
						{
							for (const rules of styleSheet.cssRules)
							{
								if (rules.style && rules.style.getPropertyValue)
								{
									console.log('r s', rules.style);
									
									for (var i = 0; i < rules.style.length; i++)
									{
										const name = rules.style[i];
										const value = rules.style.getPropertyValue(name);
										
										const templ_name = builder_globals.known_properties.includes(name) ? name : '[custom]';
										const new_prop = document.querySelector(`[data-property-name='${templ_name}']`).cloneNode(true);
										
										if (templ_name == '[custom]')
										{
											new_prop.querySelector('.builder-property-name').value = name;
										}
										
										new_prop.querySelector('.builder-property-value') = value;
									}
								}
							}
						}
					}