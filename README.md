# v-regexp
`v-regexp` is a JavaScript Regular Expression Parser & Visualizer. 

# Installation 
```sh
yarn add v-regexp
```

# Examples
```typescript
import React, { useEffect, useState } from 'react';
import { Radio, Button } from 'antd';
import vregexp from '@v-regexp';

export default function App() {
  const { parse, visualize, download } = vregexp;
  const regexp = /^d\dvar\b\s+([^a-zA-Z_]{2,5}\w*);.{0,3}(a|b\B|[\u4e00-\u9fa5]+Jack(?=Sprat)|name(?!foo)){1,2}$/;
  const [paper, setPaper] = useState(null);
  const [theme, setTheme] = useState<any>('normal');

  useEffect(() => {
    const regexpParse = parse(regexp.source);
    const p = visualize({
      regexpParse,
      flags: 'gmi',
      containerId: 'raphael',
      themeOption: theme,
    });
    setPaper(p);
  }, [theme]);

  return (
    <div style={{ padding: 20 }}>
      <Radio.Group
        style={{ marginRight: 20 }}
        options={[
          { label: 'normal', value: 'normal' },
          { label: 'gorgeous', value: 'gorgeous' },
        ]}
        onChange={(e) => {
          setTheme(e.target.value);
        }}
        value={theme}
        optionType="button"
      />
      <Button
        onClick={() => {
          download.png(paper, regexp.source);
        }}
      >
        下载图片
      </Button>
      <div style={{ marginTop: 20, overflowX: 'auto' }} id="raphael" />
    </div>
  );
}

```