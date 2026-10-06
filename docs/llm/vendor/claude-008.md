Two sort of major asks... 
1. multiple language / culture support, gradual internationalization and localization support how? would we need to write the same blog post many times? 
2. git commit sha in the footer on every page somehow? this one can be added to export.sh if necessary but ideally it should be the actual commit we build from on github pages 
NEVER EVER EVER write code comments. 
in fact, never, ever write comments at all. 
markdown files such as readme.md are the exception but even these should be as concise and terse as possible.
Delivery
Whole project as one tar.gz, unambiguous file placement
Any files to delete on updates called out explicitly
No bespoke sed/patch scripts — full files only for anything that changes
Docs updated alongside code changes
Low verbosity, no code comments
also please update all documentation 
also switch over completely to typescript 7 and prepare for typescript 7.1 
