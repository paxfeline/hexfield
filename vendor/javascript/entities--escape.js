// entities/escape@6.0.1 downloaded from https://ga.jspm.io/npm:entities@6.0.1/dist/esm/escape.js

const t=/["$&'<>\u0080-\uFFFF]/g;const n=new Map([[34,"&quot;"],[38,"&amp;"],[39,"&apos;"],[60,"&lt;"],[62,"&gt;"]]);const e=String.prototype.codePointAt==null?(t,n)=>(t.charCodeAt(n)&64512)===55296?1024*(t.charCodeAt(n)-55296)+t.charCodeAt(n+1)-56320+65536:t.charCodeAt(n):(t,n)=>t.codePointAt(n);function o(o){let s="";let c=0;let r;while((r=t.exec(o))!==null){const{index:u}=r;const i=o.charCodeAt(u);const l=n.get(i);if(l===void 0){s+=`${o.substring(c,u)}&#x${e(o,u).toString(16)};`;c=t.lastIndex+=Number((i&64512)===55296)}else{s+=o.substring(c,u)+l;c=u+1}}return s+o.substr(c)}
/**
 * Encodes all non-ASCII characters, as well as characters not valid in XML
 * documents using numeric hexadecimal reference (eg. `&#xfc;`).
 *
 * Have a look at `escapeUTF8` if you want a more concise output at the expense
 * of reduced transportability.
 *
 * @param data String to escape.
 */const s=o;
/**
 * Creates a function that escapes all characters matched by the given regular
 * expression using the given map of characters to escape to their entities.
 *
 * @param regex Regular expression to match characters to escape.
 * @param map Map of characters to escape to their entities.
 *
 * @returns Function that escapes all characters matched by the given regular
 * expression using the given map of characters to escape to their entities.
 */function c(t,n){return function(e){let o;let s=0;let c="";while(o=t.exec(e)){s!==o.index&&(c+=e.substring(s,o.index));c+=n.get(o[0].charCodeAt(0));s=o.index+1}return c+e.substring(s)}}
/**
 * Encodes all characters not valid in XML documents using XML entities.
 *
 * Note that the output will be character-set dependent.
 *
 * @param data String to escape.
 */const r=c(/["&'<>]/g,n);
/**
 * Encodes all characters that have to be escaped in HTML attributes,
 * following {@link https://html.spec.whatwg.org/multipage/parsing.html#escapingString}.
 *
 * @param data String to escape.
 */const u=c(/["&\u00A0]/g,new Map([[34,"&quot;"],[38,"&amp;"],[160,"&nbsp;"]]));
/**
 * Encodes all characters that have to be escaped in HTML text,
 * following {@link https://html.spec.whatwg.org/multipage/parsing.html#escapingString}.
 *
 * @param data String to escape.
 */const i=c(/[&<>\u00A0]/g,new Map([[38,"&amp;"],[60,"&lt;"],[62,"&gt;"],[160,"&nbsp;"]]));export{o as encodeXML,s as escape,u as escapeAttribute,i as escapeText,r as escapeUTF8,e as getCodePoint,t as xmlReplacer};

