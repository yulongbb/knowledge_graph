import { StreamLanguage } from '@codemirror/language';

export const sparql = StreamLanguage.define({
  startState() {
    return {};
  },
  token(stream) {
    if (stream.match(/^#.*/)) {
      stream.skipToEnd();
      return 'comment';
    }
    if (stream.match(/"(?:[^"\\]|\\.)*"/)) return 'string';
    if (stream.match(/<[^>]*>/)) return 'string-2';
    if (stream.match(/\?[a-zA-Z_]\w*/)) return 'variableName';
    if (
      stream.match(
        /\b(PREFIX|SELECT|WHERE|FILTER|OPTIONAL|ORDER BY|LIMIT|OFFSET|DISTINCT|REDUCED|GRAPH|UNION|ASK|DESCRIBE|CONSTRUCT|FROM|NAMED|VALUES|BIND|SERVICE|MINUS|GROUP BY|HAVING|IN|NOT IN|EXISTS|NOT EXISTS|COUNT|SUM|AVG|MIN|MAX|STR|LANG|LANGMATCHES|DATATYPE|BOUND|IRI|URI|BNODE|RAND|ABS|CEIL|FLOOR|ROUND|CONCAT|STRLEN|UCASE|LCASE|ENCODE_FOR_URI|CONTAINS|STRSTARTS|STRENDS|STRBEFORE|STRAFTER|REPLACE|ISIRI|ISURI|ISBLANK|ISLITERAL|ISNUMERIC|REGEX|SUBSTR)\b/i
      )
    )
      return 'keyword';
    if (stream.match(/[{}\[\]()]/)) return 'bracket';
    if (stream.match(/[;,.]/)) return 'punctuation';
    if (stream.match(/[0-9]+/)) return 'number';
    stream.next();
    return null;
  },
});