function highlightJSON(json, indent = 0) {
  const indentChar = ' ';
  const spaces = indentChar.repeat(indent);

  function formatValue(value, level) {
    const nextIndent = level + 1;

    if (typeof value === 'string') return `<span class="json-string">"${value}"</span>`;
    if (typeof value === 'number') return `<span class="json-value">${value}</span>`;
    if (typeof value === 'boolean') return `<span class="json-boolean">${value}</span>`;
    if (value === null) return `<span class="json-null">null</span>`;
    if (Array.isArray(value)) return formatArray(value, nextIndent);
    if (typeof value === 'object') return formatObject(value, nextIndent);

    return value;
  }

  function formatArray(array, level) {
    if (array.length === 0) return '<span class="json-brace">[]</span>';
    const openBrace = `<span class="json-brace">[</span>\n${indentChar.repeat(level * 2)}`;
    const closeBrace = `${indentChar.repeat((level - 1) * 2)}<span class="json-brace">]</span>`;

    const formattedValues = array.map(val => formatValue(val, level)).join(',\n' + indentChar.repeat(level * 2));
    return `${openBrace}${formattedValues}\n${indentChar.repeat(indent)}${closeBrace}`;
  }

  function formatObject(obj, level) {
    if (Object.keys(obj).length === 0) return '<span class="json-brace">{}</span>';

    const formattedEntries = Object.entries(obj).map(([k, v], index, arr) => {
      const isLast = index === arr.length - 1;
      const ending = isLast ? '' : '<span class="json-comma">,</span>';
      const key = `${indentChar.repeat(level * 2)}<span class="json-key">"${k}"</span>`;
      const val = formatValue(v, level);

      return `${key}: ${val}` + ending;
    });

    const openBrace = `<span class="json-brace">{</span>`;
    const closeBrace = `${indentChar.repeat((level - 1) * 2)}<span class="json-brace">}</span>`;

    const formattedValues = formattedEntries.join('\n' + spaces);
    return `${openBrace}\n${spaces}${formattedValues}\n${closeBrace}`;
  }

  return `<pre><code>${formatValue(json, 0)}</code></pre>`;
}

function clearJSONHighlighting(html) {
  return html.replace(/<\/?span[^>]*>/g, '');
}
