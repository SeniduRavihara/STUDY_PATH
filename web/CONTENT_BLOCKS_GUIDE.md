# 🎨 Node-First Content Creation System

## Overview

The flow builder now supports **flexible, composable content blocks** inside each node. Instead of pre-creating resources (MCQs, Quiz Packs), admins can now **create nodes first** and **customize content inline**.

---

## ✨ What Changed?

### **Before** (Old System):
```
1. Create MCQs in MCQ Manager
2. Create Quiz Packs
3. Create Flow
4. Link Quiz Pack to Quiz Node
```

### **After** (New System):
```
1. Create Flow
2. Add Node
3. Customize Node:
   - Add 1 text block
   - Add 3 MCQs
   - Add 1 poll
   - Add 1 meme
   - Add 1 video
4. Done! ✅
```

---

## 🧩 Content Block Types

Each node can contain multiple **content blocks**:

| Type | Description | Use Case |
|------|-------------|----------|
| **Text** | Simple text content | Paragraphs, instructions |
| **Note** | Highlighted notes (info/warning/success/error) | Important callouts |
| **MCQ** | Multiple choice question (2-6 options) | Inline quizzes |
| **Poll** | Yes/No or multiple option poll | Student engagement |
| **Video** | Video embed (YouTube, Vimeo, etc.) | Video lessons |
| **Image** | Image with caption | Diagrams, illustrations |
| **Meme** | Meme generator format (top/bottom text) | Fun educational content |
| **Code** | Code snippet with syntax highlighting | Programming examples |

---

## 🎯 How to Use

### 1. **Create a Flow**
- Go to Subject Builder
- Select a topic
- Click "Create Flow"

### 2. **Add Nodes**
- Click "+" button
- Select node type (Study, Quiz, Video, etc.)

### 3. **Customize Node**
- Select the node
- Go to "Content Blocks" tab
- Click "+ Add Content Block"
- Choose block type
- Fill in content

### 4. **Example: Study Node**
```
Node: "Introduction to Variables"
├── Text Block: "In programming, a variable is..."
├── Note Block (info): "💡 Remember: Variables must be declared"
├── Image Block: "Variable diagram"
├── MCQ Block: "What is a variable?"
│   ├── Option A: "A function"
│   ├── Option B: "A container for data" ✓
│   ├── Option C: "A loop"
│   └── Explanation: "Variables store data"
└── Poll Block: "Do you understand?"
    ├── Yes
    └── No
```

---

## 💾 Database Structure

### New Column: `content_blocks`
```sql
content_blocks JSONB DEFAULT '[]'
```

### Content Block Schema:
```typescript
interface ContentBlock {
  id: string;              // Unique identifier
  type: string;            // Block type
  order: number;           // Display order
  data: {                  // Type-specific data
    // Text
    content?: string;
    
    // Note
    title?: string;
    content?: string;
    style?: 'info' | 'warning' | 'success' | 'error';
    
    // MCQ
    question?: string;
    options?: string[];
    correctAnswer?: number;
    explanation?: string;
    
    // Poll
    question?: string;
    options?: string[];
    allowMultiple?: boolean;
    
    // Video
    url?: string;
    title?: string;
    description?: string;
    
    // Image
    url?: string;
    caption?: string;
    alt?: string;
    
    // Meme
    imageUrl?: string;
    topText?: string;
    bottomText?: string;
    
    // Code
    code?: string;
    language?: string;
    title?: string;
  };
}
```

---

## 🔄 Migration Guide

### Run the Migration:
```bash
# In supabase folder
npx supabase db reset

# Or apply specific migration
npx supabase db push
```

### Migration File:
`supabase/migrations/20251022000000_add_content_blocks_to_flow_nodes.sql`

**What it does:**
- Adds `content_blocks` JSONB column
- Adds GIN index for performance
- Creates helper functions:
  - `validate_content_block()`
  - `count_content_blocks_by_type()`
  - `get_flow_mcqs()`

---

## 🎨 UI Components

### 1. **ContentBlockEditor.tsx**
Main component for managing content blocks.

**Features:**
- Add/remove blocks
- Reorder blocks (up/down)
- Type-specific editors
- Drag to reorder (visual indicator)

### 2. **NodePropertiesPanel.tsx**
Updated with tabs:
- **Basic Info**: Node properties (title, XP, difficulty)
- **Content Blocks**: Inline content editor

---

## 🚀 Benefits

### For Admins:
✅ **Faster content creation** - No pre-planning needed  
✅ **Flexible node design** - Mix multiple content types  
✅ **Inline editing** - Everything in one place  
✅ **Visual feedback** - See block count badges  
✅ **Reusable patterns** - Copy node structures  

### For Students (Mobile App):
✅ **Richer learning experience** - Varied content types  
✅ **Engaging content** - Memes, polls, videos  
✅ **Bite-sized learning** - Small content blocks  
✅ **Interactive** - Inline quizzes and polls  

---

## 📱 Mobile App Integration

The mobile app will need to:

1. **Parse content_blocks** array from flow_nodes
2. **Render blocks sequentially** in the node view
3. **Handle different block types**:
   - Text: Simple text display
   - Note: Styled callout boxes
   - MCQ: Interactive quiz component
   - Poll: Voting interface
   - Video: Video player (YouTube embed)
   - Image: Image viewer with caption
   - Meme: Meme display with top/bottom text
   - Code: Syntax-highlighted code viewer

### Example Mobile Component:
```typescript
// Mobile: FlowNodeContent.tsx
const FlowNodeContent = ({ node }) => {
  return (
    <ScrollView>
      {node.content_blocks.map((block) => {
        switch (block.type) {
          case 'text':
            return <TextBlock data={block.data} />;
          case 'note':
            return <NoteBlock data={block.data} />;
          case 'mcq':
            return <MCQBlock data={block.data} />;
          case 'poll':
            return <PollBlock data={block.data} />;
          case 'video':
            return <VideoBlock data={block.data} />;
          // ... other types
        }
      })}
    </ScrollView>
  );
};
```

---

## 🔧 Backward Compatibility

✅ **Existing nodes still work** - Old `config` field preserved  
✅ **Quiz packs still supported** - Legacy quiz pack linking works  
✅ **No breaking changes** - All old data intact  
✅ **Gradual migration** - Use new system for new content  

---

## 💡 Best Practices

### 1. **Content Block Order**
- Start with text/note (context)
- Add interactive elements (MCQ/poll)
- End with media (video/image)

### 2. **MCQ Design**
- Keep questions clear and concise
- 2-6 options (4 is ideal)
- Always provide explanations
- Mix difficulty levels

### 3. **Note Styles**
- 💡 **Info**: General information
- ⚠️ **Warning**: Important caveats
- ✅ **Success**: Best practices
- ❌ **Error**: Common mistakes

### 4. **Video Usage**
- Keep videos under 10 minutes
- Add descriptions
- Provide YouTube/Vimeo links

---

## 🎓 Example Flows

### **Complete Study Node:**
```
Node: "JavaScript Functions"
1. Text: "Functions are reusable code blocks..."
2. Note (info): "💡 Functions help organize code"
3. Code: 
   ```javascript
   function greet(name) {
     return `Hello, ${name}!`;
   }
   ```
4. MCQ: "What does this function return?"
5. Video: "Functions explained (5 min)"
6. Poll: "Did you understand?"
```

### **Quiz Node:**
```
Node: "Variables Quiz"
1. Note (warning): "⚠️ This quiz tests your understanding"
2. MCQ #1: "What is a variable?"
3. MCQ #2: "How to declare a variable?"
4. MCQ #3: "Variable naming rules?"
5. Text: "Great job! Let's move on..."
```

---

## 📊 Database Queries

### Get all MCQs from a flow:
```sql
SELECT * FROM get_flow_mcqs('flow-uuid-here');
```

### Count content blocks by type:
```sql
SELECT count_content_blocks_by_type('node-uuid', 'mcq');
```

### Get nodes with videos:
```sql
SELECT * FROM flow_nodes 
WHERE content_blocks @> '[{"type": "video"}]'::jsonb;
```

---

## 🐛 Troubleshooting

### Issue: Content blocks not saving
**Solution:** Ensure migration is applied:
```bash
npx supabase db reset
```

### Issue: Old nodes don't have content_blocks
**Solution:** They default to `[]` - this is expected

### Issue: Blocks not rendering in mobile
**Solution:** Ensure mobile app has updated FlowNode types

---

## 🎉 Summary

You now have a **powerful, flexible content creation system** that:
- ✅ Eliminates pre-creation workflow
- ✅ Enables inline editing
- ✅ Supports multiple content types
- ✅ Maintains backward compatibility
- ✅ Enhances student learning experience

**Start creating amazing educational content! 🚀**
