# Node Journey Architecture - Sequential Learning Experience

## 🎯 Vision: Node as a Learning Journey

### Concept
Each **node** in the flow represents a complete **learning journey** consisting of multiple sequential activities. Students must complete each activity in order before progressing to the next node.

```
FLOW (Topic/Subject)
  ↓
NODE 1 (e.g., "Introduction to Calculus")
  ├── Block 1: Text (Introduction)
  ├── Block 2: Video (Explanation)
  ├── Block 3: MCQ (Quick Check)
  ├── Block 4: Note (Summary)
  └── Block 5: MCQ Pack (Assessment)
  ↓ [Complete all 5 blocks]
  ↓
NODE 2 (e.g., "Limits and Continuity")
  ├── Block 1: Text (Theory)
  ├── Block 2: Image (Diagram)
  ├── Block 3: Poll (Understanding Check)
  └── Block 4: Code (Practice)
  ↓ [Complete all 4 blocks]
  ↓
NODE 3 (Next topic...)
```

## 👨‍💼 Admin Experience: Crafting the Journey

### Workflow:
1. **Create Node** → Opens empty node
2. **Customize Node** → Admin's creative phase:
   - Add content blocks one by one
   - Arrange in meaningful sequence
   - Mix different block types
   - Each block = one learning step/activity
3. **Preview Journey** → See how students will experience it
4. **Save Node** → Journey complete
5. **Move to Next Node** → Create next journey

### Admin UI Flow:
```
FlowBuilder (Canvas)
  ↓ [Click "Add Node"]
  ↓
New Node Created (in list)
  ↓ [Click on Node]
  ↓
NodePropertiesPanel Opens (Side Panel)
  ├── Tab 1: Basic Info (title, description, XP, difficulty)
  └── Tab 2: Content Blocks ⭐
      ↓ [Click "Add Content Block"]
      ↓
      Block Type Selector Modal
        - Text
        - Note
        - Single MCQ
        - MCQ Pack (opens full-page modal)
        - Poll
        - Video
        - Image
        - Meme
        - Code
      ↓ [Select Type]
      ↓
      Block Editor (inline or modal)
      ↓ [Save Block]
      ↓
      Block Added to Node (ordered list)
      ↓ [Repeat to add more blocks]
      ↓
      Blocks displayed in sequence with drag handles
      ↓ [Can reorder, edit, delete]
      ↓
      [Save Node]
      ↓
      Node journey complete!
```

## 📱 Mobile User Experience: Walking the Journey

### Current State (What Exists):
- ✅ Flow visualization (vertical path with nodes)
- ✅ Node selection (tap to open)
- ✅ Node modal (shows title, description, estimated time)
- ✅ Navigation to lesson screen
- ❌ **Content blocks rendering NOT implemented yet**

### Desired State (What's Needed):

#### New Component: `NodeJourneyViewer.tsx`
```tsx
// Location: study-path/components/NodeJourneyViewer.tsx

interface ContentBlock {
  id: string;
  type: 'text' | 'note' | 'mcq' | 'mcq_pack' | 'poll' | 'video' | 'image' | 'meme' | 'code';
  order: number;
  data: any;
}

interface NodeJourneyViewerProps {
  nodeId: string;
  nodeTitle: string;
  contentBlocks: ContentBlock[];
  onComplete: () => void; // Called when all blocks completed
  onExit: () => void;
}

// Flow:
// 1. Display blocks sequentially (one at a time)
// 2. User interacts with current block
// 3. After completion → Show "Next" button
// 4. Next button → Load next block
// 5. Repeat until all blocks done
// 6. Show completion screen → Award XP
// 7. Return to flow → Unlock next node
```

#### Mobile User Flow:
```
Flow Screen (LearningFlowPath)
  ↓ [Tap Node]
  ↓
Node Modal (CustomModal)
  - Shows: Title, Description, Time, XP
  - Button: "Start" / "Continue"
  ↓ [Tap Start]
  ↓
NodeJourneyViewer Screen
  ↓
Block 1 - Text Block
  - Display: Title + Content (markdown?)
  - Action: Read
  - Button: "Continue" (appears after 5 seconds?)
  ↓ [Tap Continue]
  ↓
Block 2 - Video Block
  - Display: Video player
  - Action: Watch video
  - Button: "Continue" (appears after video watched)
  ↓ [Tap Continue]
  ↓
Block 3 - MCQ Block
  - Display: Question + Options
  - Action: Select answer → Submit
  - Feedback: Correct ✅ / Wrong ❌
  - Button: "Next Question" / "Continue"
  ↓ [Answer Correct → Tap Continue]
  ↓
Block 4 - Note Block
  - Display: Important note (highlighted box)
  - Action: Read
  - Button: "Got it!"
  ↓ [Tap Got it]
  ↓
Block 5 - MCQ Pack Block
  - Display: "Quiz Time! 5 Questions"
  - Action: Answer all questions (like quiz screen)
  - Progress: Question 1 of 5
  - Scoring: Track correct answers
  - Button: "Submit Quiz"
  ↓ [Complete Quiz]
  ↓
Completion Screen
  - 🎉 Confetti animation
  - "Journey Complete!"
  - Display: XP earned, accuracy, time taken
  - Button: "Back to Flow"
  ↓ [Tap Back]
  ↓
Return to Flow Screen
  - Node status: "completed" ✅
  - Next node: "available" (unlocked)
  - XP added to user stats
```

## 🗂️ Data Structure

### Database Schema (Already Created):
```sql
-- flow_nodes table
CREATE TABLE flow_nodes (
  id UUID PRIMARY KEY,
  flow_id UUID REFERENCES flows(id),
  node_type TEXT,
  title TEXT,
  description TEXT,
  sort_order INTEGER,
  content_blocks JSONB DEFAULT '[]', -- ⭐ This stores the journey!
  xp_reward INTEGER,
  difficulty TEXT,
  estimated_time INTEGER,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

### Content Blocks JSON Structure:
```json
{
  "content_blocks": [
    {
      "id": "block-1",
      "type": "text",
      "order": 0,
      "data": {
        "content": "Welcome to Calculus! In this lesson, we'll explore the fundamental concepts..."
      }
    },
    {
      "id": "block-2",
      "type": "video",
      "order": 1,
      "data": {
        "url": "https://youtube.com/watch?v=...",
        "thumbnail": "...",
        "duration": "10:30"
      }
    },
    {
      "id": "block-3",
      "type": "mcq",
      "order": 2,
      "data": {
        "question": "What is the derivative of x²?",
        "options": ["2x", "x", "2x²", "x²"],
        "correctIndex": 0,
        "explanation": "Using the power rule, d/dx(x²) = 2x"
      }
    },
    {
      "id": "block-4",
      "type": "note",
      "order": 3,
      "data": {
        "type": "info",
        "content": "💡 Remember: The derivative represents the rate of change!"
      }
    },
    {
      "id": "block-5",
      "type": "mcq_pack",
      "order": 4,
      "data": {
        "title": "Practice Quiz",
        "description": "Test your understanding",
        "mcqs": [
          {
            "question": "Question 1...",
            "options": ["A", "B", "C", "D"],
            "correctIndex": 2,
            "explanation": "..."
          },
          // ... more questions
        ]
      }
    }
  ]
}
```

## 🎨 Implementation Plan

### Phase 1: Admin Side (✅ COMPLETE)
- ✅ ContentBlockEditor component (9 block types)
- ✅ NodePropertiesPanel integration (tabbed interface)
- ✅ MCQPackEditorModal (full-page modal)
- ✅ Database migration (content_blocks column)
- ✅ FlowBuilder updates (content_blocks field)

### Phase 2: Mobile Rendering (❌ TO BE DONE)

#### Step 1: Create Block Renderer Components
```
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
```

#### Step 2: Create NodeJourneyViewer
```tsx
// study-path/components/NodeJourneyViewer.tsx
export default function NodeJourneyViewer({ nodeId, contentBlocks }) {
  const [currentBlockIndex, setCurrentBlockIndex] = useState(0);
  const [completedBlocks, setCompletedBlocks] = useState<Set<string>>(new Set());
  
  const currentBlock = contentBlocks[currentBlockIndex];
  const totalBlocks = contentBlocks.length;
  const progress = (completedBlocks.size / totalBlocks) * 100;
  
  const handleBlockComplete = (blockId: string) => {
    setCompletedBlocks(prev => new Set([...prev, blockId]));
    
    if (currentBlockIndex < totalBlocks - 1) {
      // Move to next block
      setCurrentBlockIndex(prev => prev + 1);
    } else {
      // All blocks completed!
      handleJourneyComplete();
    }
  };
  
  return (
    <View className="flex-1 bg-slate-900">
      {/* Progress Bar */}
      <View className="h-1 bg-slate-800">
        <View style={{ width: `${progress}%` }} className="h-full bg-green-500" />
      </View>
      
      {/* Block Counter */}
      <View className="p-4 bg-slate-800">
        <Text className="text-white text-center">
          Step {currentBlockIndex + 1} of {totalBlocks}
        </Text>
      </View>
      
      {/* Current Block Renderer */}
      <ScrollView className="flex-1">
        {renderBlock(currentBlock, handleBlockComplete)}
      </ScrollView>
    </View>
  );
}
```

#### Step 3: Update Flow Screen
```tsx
// study-path/app/(tabs)/study/flow.tsx

const handleNodePress = (node: LearningNode) => {
  if (node.status === "locked") {
    // Show locked message
    return;
  }
  
  // Navigate to node journey
  router.push({
    pathname: "/study/node-journey",
    params: {
      nodeId: node.id,
      nodeTitle: node.title,
      nodeData: JSON.stringify(node), // Contains content_blocks
    },
  });
};
```

#### Step 4: Create Node Journey Screen
```
study-path/app/(tabs)/study/
└── node-journey.tsx (new file)
```

### Phase 3: User Progress Tracking (Future)
```sql
-- user_node_progress table
CREATE TABLE user_node_progress (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  node_id UUID REFERENCES flow_nodes(id),
  current_block_index INTEGER DEFAULT 0,
  completed_blocks JSONB DEFAULT '[]', -- Array of block IDs
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  time_spent INTEGER, -- seconds
  xp_earned INTEGER
);
```

## 🎯 Key Benefits

### For Admin:
- ✅ **Flexible Content Creation**: Mix any block types
- ✅ **Visual Journey Building**: See the sequence as you build
- ✅ **No Pre-Creation Required**: Create content directly in node
- ✅ **Full Control**: Reorder, edit, delete blocks easily
- ✅ **Spacious Editing**: Full-page modal for complex content (MCQ Packs)

### For Students:
- 📚 **Guided Learning**: Clear step-by-step progression
- 🎯 **Focused Experience**: One activity at a time
- 🏆 **Progress Visibility**: See how far through the journey
- ✅ **Clear Completion**: Know when node is done
- 🚀 **Motivation**: Unlock next node after completion

### For Platform:
- 📊 **Rich Analytics**: Track time per block, completion rates
- 🎓 **Adaptive Learning**: Can adjust difficulty based on performance
- 🔄 **Content Reusability**: Blocks can be templates
- 📈 **Engagement**: Sequential flow keeps users engaged

## 🚧 Current Status

### ✅ Ready to Use (Admin Side):
1. Open web admin panel: `cd web && npm run dev`
2. Navigate to Subject Builder
3. Create/select a flow
4. Add nodes
5. Click on node → "Content Blocks" tab
6. Add blocks in sequence
7. Reorder with drag handles
8. Edit MCQ Packs in full-page modal
9. Save node

### ⏳ Needs Implementation (Mobile Side):
1. Create block renderer components (9 components)
2. Create NodeJourneyViewer component
3. Create node-journey.tsx screen
4. Update flow.tsx navigation logic
5. Fetch content_blocks from database
6. Implement progress tracking
7. Award XP on completion
8. Update node status to "completed"

## 📝 Example Journey: "Introduction to Derivatives"

### Admin Creates:
```
Node Title: "Introduction to Derivatives"
Description: "Learn the fundamental concept of derivatives"
XP: 50 | Difficulty: Medium | Time: 15 min

Content Blocks:
1. [Text] Welcome message + learning objectives
2. [Video] 5-min explanation video
3. [MCQ] Quick check: "What does derivative measure?"
4. [Image] Graph showing tangent line concept
5. [Note] Important: "Derivative = slope of tangent"
6. [Code] Python example: numerical derivative
7. [MCQ Pack] 5-question practice quiz
8. [Text] Summary + congratulations
```

### Student Experiences:
```
1. Opens node from flow screen
2. Sees modal: "Introduction to Derivatives - 15 min - 50 XP"
3. Taps "Start"
4. Screen 1: Reads welcome text → Taps "Continue"
5. Screen 2: Watches 5-min video → Taps "Continue"
6. Screen 3: Answers MCQ → Gets feedback → Taps "Next"
7. Screen 4: Views graph image → Taps "Continue"
8. Screen 5: Reads important note → Taps "Got it!"
9. Screen 6: Sees Python code → Taps "Continue"
10. Screen 7: Takes 5-question quiz → Submits answers
11. Screen 8: Reads summary → Taps "Complete"
12. 🎉 Completion screen: "+50 XP! Journey Complete!"
13. Returns to flow → Node marked completed ✅
14. Next node unlocks 🔓
```

## 🔮 Future Enhancements

### Advanced Block Types:
- **Interactive Code**: Live code editor with execution
- **3D Models**: Rotate/zoom 3D objects
- **Audio**: Listen to explanations
- **File Upload**: Submit assignments
- **Discussion**: Comment/discussion threads
- **Peer Review**: Review other students' work

### Advanced Features:
- **Branching**: Different paths based on answers
- **Conditional Blocks**: Show/hide based on progress
- **Time Limits**: Timed challenges
- **Hints System**: Progressive hints for hard questions
- **Bookmarks**: Save position in long journeys
- **Offline Support**: Download journey for offline study

## 🎬 Conclusion

The **Node Journey Architecture** transforms learning from disconnected resources into **cohesive, guided experiences**. Each node becomes a complete learning journey, giving admins creative freedom and students a clear path to mastery.

**Current State**: ✅ Admin tools ready
**Next Step**: 🚀 Implement mobile rendering
**Impact**: 🎯 Revolutionary learning experience
