# Node Journey - Quick Reference

## 🎯 The Big Picture

```
ADMIN CREATES JOURNEY        →        STUDENT WALKS JOURNEY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Web Admin Panel                        Mobile App
    ↓                                      ↓
FlowBuilder Canvas                     Flow Screen (Vertical Path)
    ↓                                      ↓
Add Node                               Tap Node
    ↓                                      ↓
NodePropertiesPanel                    See Modal (Title, Time, XP)
    ↓                                      ↓
Click "Content Blocks" Tab             Tap "Start"
    ↓                                      ↓
Add Blocks in Sequence:                Experience Blocks in Sequence:
  - Block 1: Text                        - Read Text → Continue
  - Block 2: Video                       - Watch Video → Continue
  - Block 3: MCQ                         - Answer MCQ → Next
  - Block 4: Note                        - Read Note → Got it
  - Block 5: MCQ Pack                    - Take Quiz → Submit
    ↓                                      ↓
Reorder / Edit / Delete                Progress Bar: 5/5 Complete
    ↓                                      ↓
Save Node                              🎉 +50 XP! Node Complete!
    ↓                                      ↓
Move to Next Node                      Next Node Unlocked 🔓
```

## 📊 What You Built (Admin Side)

### ✅ Components Created:
```
web/src/components/
├── ContentBlockEditor.tsx      (550+ lines) - Main block editor
├── MCQPackEditorModal.tsx      (400+ lines) - Full-page MCQ editor
└── NodePropertiesPanel.tsx     (updated)    - Tabbed interface

web/CONTENT_BLOCKS_GUIDE.md               - Documentation
web/MCQ_PACK_MODAL_INTEGRATION.md          - Modal integration docs
```

### ✅ Database:
```sql
ALTER TABLE flow_nodes 
ADD COLUMN content_blocks JSONB DEFAULT '[]';

-- Migration file: 
-- supabase/migrations/20251022000000_add_content_blocks_to_flow_nodes.sql
```

### ✅ Features:
- 9 block types (text, note, mcq, mcq_pack, poll, video, image, meme, code)
- Drag-and-drop reordering
- Inline editing for simple blocks
- Full-page modal for MCQ Packs
- Add/remove/edit blocks
- JSONB storage in PostgreSQL

## 🎨 Admin Workflow (Step-by-Step)

```
1. CREATE NODE
   FlowBuilder → Click "Add Node" button
   
2. CUSTOMIZE NODE - BASIC INFO
   Click node → NodePropertiesPanel opens
   Tab 1: Basic Info
   - Enter title: "Introduction to Calculus"
   - Enter description
   - Set XP: 50
   - Set difficulty: Medium
   - Set time: 15 min
   
3. CUSTOMIZE NODE - CONTENT BLOCKS
   Tab 2: Content Blocks
   - Click "Add Content Block"
   - Select block type from modal
   
4. ADD BLOCKS (Example Journey):
   
   Block 1 - Text:
   ├── Click "Text" block type
   ├── Enter content in editor
   └── Block appears in list
   
   Block 2 - Video:
   ├── Click "Video" block type
   ├── Paste YouTube URL
   └── Block appears in list
   
   Block 3 - MCQ:
   ├── Click "Single MCQ" block type
   ├── Enter question
   ├── Add options (2-6)
   ├── Select correct answer
   └── Add explanation (optional)
   
   Block 4 - MCQ Pack:
   ├── Click "MCQ Pack" block type
   ├── Block appears with preview
   ├── Click "Edit Pack" button
   ├── FULL-PAGE MODAL OPENS 🎉
   ├── Left sidebar: Question list
   ├── Right content: Active question editor
   ├── Add multiple questions
   ├── Navigate between questions
   ├── Click "Save Changes"
   └── Modal closes, block updated
   
5. REORDER BLOCKS
   - Drag blocks up/down using grip handle
   - Order determines student experience
   
6. SAVE NODE
   - Changes auto-save to database
   - content_blocks stored as JSONB array
   
7. TEST IN MOBILE
   - Open mobile app
   - Navigate to flow
   - See node in path
   - (Rendering not implemented yet)
```

## 📱 Mobile Workflow (What's Needed)

### Current State:
```
✅ Flow visualization (vertical path)
✅ Node cards with status (locked/available/completed)
✅ Node modal (title, description, time, XP)
✅ Navigation to lesson screen
❌ Content blocks rendering (NOT IMPLEMENTED)
```

### What Needs to be Built:
```
1. Block Renderer Components (9 files)
   study-path/components/blocks/
   ├── TextBlockRenderer.tsx
   ├── NoteBlockRenderer.tsx
   ├── MCQBlockRenderer.tsx
   ├── MCQPackBlockRenderer.tsx
   ├── PollBlockRenderer.tsx
   ├── VideoBlockRenderer.tsx
   ├── ImageBlockRenderer.tsx
   ├── MemeBlockRenderer.tsx
   └── CodeBlockRenderer.tsx

2. Journey Viewer Component
   study-path/components/NodeJourneyViewer.tsx
   - Sequential block display
   - Progress tracking
   - Block completion logic
   - Navigation (Next/Previous)
   
3. Journey Screen
   study-path/app/(tabs)/study/node-journey.tsx
   - Full-screen journey experience
   - Integrates NodeJourneyViewer
   - Handles completion & XP award
   
4. Update Flow Screen Navigation
   study-path/app/(tabs)/study/flow.tsx
   - Change navigation from lesson.tsx to node-journey.tsx
   - Pass node data with content_blocks
```

## 🔄 Data Flow

### Admin → Database:
```typescript
// Admin creates/edits blocks
contentBlocks = [
  { id: '1', type: 'text', order: 0, data: {...} },
  { id: '2', type: 'video', order: 1, data: {...} },
  // ...
]

// Saved to database
await supabase
  .from('flow_nodes')
  .update({ content_blocks: contentBlocks })
  .eq('id', nodeId)
```

### Database → Mobile:
```typescript
// Mobile fetches node
const { data: node } = await supabase
  .from('flow_nodes')
  .select('*, content_blocks')
  .eq('id', nodeId)
  .single()

// Render blocks sequentially
node.content_blocks.forEach((block, index) => {
  renderBlock(block, index)
})
```

## 🎯 Key Concepts

### 1. Node = Journey
Each node is a complete learning experience, not just a single resource.

### 2. Sequential Flow
Students experience blocks ONE AT A TIME in order. No skipping.

### 3. Flexible Content
Admin can mix any block types: text → video → quiz → note → code

### 4. Progress Tracking
System knows:
- Which block student is on
- Which blocks completed
- Time spent per block
- Overall journey progress

### 5. Completion Gates
- Complete Block 1 → Unlock Block 2
- Complete Block 2 → Unlock Block 3
- Complete all blocks → Complete node → Unlock next node

## 📐 Example Journeys

### Journey 1: "Introduction to Variables" (Programming)
```
1. [Text]      What are variables? (30 sec read)
2. [Video]     5-min tutorial video
3. [Code]      Example: int x = 5;
4. [MCQ]       Quick check: "What is x?"
5. [Note]      💡 Variables store data
6. [Code]      Try it yourself! (interactive)
7. [MCQ Pack]  5 practice questions
8. [Text]      Summary + next steps
```

### Journey 2: "Photosynthesis" (Biology)
```
1. [Text]      Introduction to photosynthesis
2. [Image]     Diagram: Plant cell structure
3. [Video]     Animation: Light reactions
4. [MCQ]       "Where does photosynthesis occur?"
5. [Note]      ⚠️ Remember: 6CO2 + 6H2O → C6H12O6 + 6O2
6. [Poll]      "Which factor affects rate most?"
7. [Image]     Graph: Light intensity vs rate
8. [MCQ Pack]  10-question quiz
9. [Text]      Well done! Move to cellular respiration →
```

### Journey 3: "Essay Writing" (English)
```
1. [Text]      The 5-paragraph essay structure
2. [Video]     How to write a thesis statement
3. [MCQ]       Identify the thesis statement
4. [Text]      Body paragraph structure
5. [Note]      📝 Topic sentence → Evidence → Analysis
6. [Poll]      Which transition word fits?
7. [MCQ Pack]  Grammar and structure quiz
8. [Meme]      "When your conclusion is just intro reversed" 😄
9. [Text]      Practice: Write your own essay!
```

## 🚀 Next Steps

### Immediate (Testing):
```bash
# 1. Apply database migration
cd supabase
npx supabase db reset

# 2. Start web admin
cd web
npm run dev
# Open: http://localhost:5173

# 3. Test admin features
- Create subject
- Create flow
- Add nodes
- Add content blocks to nodes
- Test MCQ Pack full-page modal
```

### Short-term (Mobile Rendering):
```
1. Create block renderer components
2. Create NodeJourneyViewer
3. Create node-journey screen
4. Update flow navigation
5. Test end-to-end flow
```

### Long-term (Enhancements):
```
- Progress persistence
- Offline support
- Advanced block types
- Branching journeys
- Analytics dashboard
```

## 📚 Documentation Files

1. **NODE_JOURNEY_ARCHITECTURE.md** - Complete vision & implementation plan
2. **CONTENT_BLOCKS_GUIDE.md** - Block types & usage guide
3. **MCQ_PACK_MODAL_INTEGRATION.md** - Modal integration docs
4. **THIS FILE** - Quick reference for daily use

## 🎓 Remember

> **"One node = One journey. Each journey = Multiple learning experiences. Complete the journey, unlock the next. Keep walking the path to mastery."**

---

**Admin creates the map. Students walk the path. The journey is the learning.**
