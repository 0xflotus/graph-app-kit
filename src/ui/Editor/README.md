A component that provides Cypher syntax highlighting and autocompletion (ctrl + space will trigger 'autocomplete').

Simple exmaple:
```javascript
<CodeMirror
  value="RETURN 1"
/>
```

For more advanced usage, the component can also accept a custom schema. This adds additional highlighting and autocomplete functionality.

```javascript
<CodeMirror
  value="RETURN 1"
  autoCompleteSchema={{
      consoleCommands: [
        // name must start with ':'
        {name: ":head", description: " - send HTTP HEAD to Neo4j's REST interface"}
      ],
      
      functions: [
        {name: "all", signature: "(variable IN list WHERE predicate :: ANY) :: (BOOLEAN)"}
      ],
      
      parameters: ["a", "b", "c"],
      
      // values must start with ':'
      labels: [":A", ":B", ":C"],
      
      // triggered inside '[]', e.g. MATCH ()-[X]
      relationshipTypes: [":X", ":Y", ":Z"],
      // triggered inside node parenthesis '()'
      propertyKeys: ["x", "y", "z"],
      
      procedures: [
        {name: "db.constraints", signature: "(timeOutSeconds = 300 :: INTEGER?) :: VOID", returnItems: [
          {name: "description", signature: "STRING?"}
        ]}
      ]
    }}
/>
```
