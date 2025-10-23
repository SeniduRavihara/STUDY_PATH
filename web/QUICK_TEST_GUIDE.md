# 🎯 Quick Test Guide - Content Blocks with Mock Data

## What Changed

✅ **New nodes now come with sample content blocks automatically!**

When you create a new node, it will automatically have 3 sample blocks:
1. **Text Block** - Sample welcome message
2. **Video Block** - Sample YouTube URL
3. **MCQ Block** - Sample quiz question (2 + 2 = ?)

## How to Test RIGHT NOW

### Step 1: Start the Web Admin
```bash
cd web
npm run dev
```
Open: http://localhost:5173

### Step 2: Navigate to Subject Builder
1. Click on a subject (or create one)
2. Go to "Subject Builder" page
3. You'll see the flow builder canvas

### Step 3: Create a Node
1. Click the **"+ Add Node"** button
2. Select any node type (Study, Quiz, Video, etc.)
3. **BOOM!** Node created with 3 sample content blocks inside

### Step 4: View Content Blocks
1. Click on the newly created node card
2. NodePropertiesPanel opens on the right
3. You'll see two tabs:
   - **Basic Info** (default)
   - **Content Blocks** ⭐
4. Click the **"Content Blocks"** tab

### Step 5: See the Sample Blocks!
You'll immediately see 3 blocks:

```
📄 Text (Block 1)
├── Content: "Welcome to this learning node..."
└── Editable inline

🎥 Video (Block 2)
├── URL: YouTube link
└── Platform: YouTube

❓ MCQ (Block 3)
├── Question: "What is 2 + 2?"
├── Options: 3, 4, 5, 6
├── Correct: 4
└── Explanation included
```

### Step 6: Add More Blocks
1. Click **"Add Content Block"** button
2. Modal opens with 9 block types
3. Select any type:
   - **Text** - Write content
   - **Note** - Important info (info/warning/success)
   - **Single MCQ** - Quiz question
   - **MCQ Pack** - Multiple questions (opens full-page modal!) 🎉
   - **Poll** - Survey question
   - **Video** - YouTube/Vimeo
   - **Image** - Upload/link image
   - **Meme** - Fun image
   - **Code** - Code snippet

### Step 7: Test MCQ Pack Full-Page Modal
1. Click "Add Content Block"
2. Select **"MCQ Pack"**
3. Block appears with preview
4. Click the **"Edit Pack"** button
5. **FULL-PAGE MODAL OPENS!** 🚀
6. Left sidebar:
   - Enter pack title
   - Enter description
   - Question list
7. Right panel:
   - Edit active question
   - Add/remove options
   - Select correct answer
8. Click **"Save Changes"**
9. Modal closes, changes saved!

### Step 8: Reorder Blocks
1. See the grip handle (⋮⋮) on the left of each block
2. Drag blocks up/down to reorder
3. Order determines student experience sequence

### Step 9: Edit Blocks
1. Click to expand any block
2. Edit content directly
3. Changes update immediately

### Step 10: Delete Blocks
1. Click the trash icon (🗑️) on any block
2. Block removed

## What Works (No Database Needed!)

✅ Create nodes with sample blocks
✅ View blocks in Content Blocks tab
✅ Add new blocks (all 9 types)
✅ Edit blocks inline
✅ MCQ Pack full-page modal editor
✅ Reorder blocks (drag & drop)
✅ Delete blocks
✅ All UI interactions work!

## What Doesn't Work Yet (Expected)

❌ Saving to database (we're using mock data)
❌ Loading from database (all data in memory)
❌ Persistence between page refreshes
❌ Mobile app rendering (not implemented)

## Sample Mock Data Structure

Each new node gets this:

```javascript
content_blocks: [
  {
    id: 'block-1234567890-1',
    type: 'text',
    order: 0,
    data: {
      content: 'Welcome to this learning node! ...'
    }
  },
  {
    id: 'block-1234567890-2',
    type: 'video',
    order: 1,
    data: {
      url: 'https://www.youtube.com/watch?v=...',
      platform: 'youtube'
    }
  },
  {
    id: 'block-1234567890-3',
    type: 'mcq',
    order: 2,
    data: {
      question: 'What is 2 + 2?',
      options: ['3', '4', '5', '6'],
      correctIndex: 1,
      explanation: 'The correct answer is 4...'
    }
  }
]
```

## Try This Exercise

### Create a Complete Learning Journey:

1. **Create Node**: "Introduction to Variables"

2. **Add Blocks in Order**:
   ```
   1. Text: "What are variables?"
   2. Video: Programming tutorial
   3. MCQ: Quick check question
   4. Note: Important reminder
   5. Code: Example code
   6. MCQ Pack: 5 practice questions
   7. Text: Summary
   ```

3. **Reorder** them to make sense

4. **Edit** each block with real content

5. **Preview** the journey flow

This is exactly what students will experience on mobile (once we build the renderers)!

## Testing Different Block Types

### 1. Text Block
- Write paragraphs
- Format with line breaks
- Add instructions

### 2. Note Block
- Type: info, warning, success
- Content: Important message

### 3. Single MCQ
- Question text
- 2-6 options
- Select correct answer
- Add explanation

### 4. MCQ Pack (FULL-PAGE MODAL!)
- Pack title: "Practice Quiz"
- Description: "Test your knowledge"
- Add multiple questions:
  - Question 1: "What is...?"
  - Question 2: "How does...?"
  - Question 3: "Why is...?"
- Navigate between questions
- Each has options and correct answer

### 5. Poll
- Poll question
- Multiple options
- No correct answer (opinion)

### 6. Video
- YouTube URL: `https://youtube.com/watch?v=...`
- Or Vimeo URL
- Platform auto-detected

### 7. Image
- Image URL
- Alt text for accessibility

### 8. Meme
- Funny/engaging image URL
- Keeps learning fun!

### 9. Code
- Select language (JS, Python, Java, etc.)
- Paste code snippet
- Syntax highlighting preview

## Next Steps After Testing

Once you're happy with the UI:

1. **Add Database Integration** (optional)
   - Save blocks to Supabase
   - Load on page refresh

2. **Build Mobile Renderers** (main work)
   - 9 block renderer components
   - Sequential journey viewer
   - Progress tracking

3. **Test End-to-End**
   - Admin creates journey
   - Student walks through
   - Complete blocks sequentially
   - Earn XP, unlock next node

## Tips

💡 **Start Simple**: Create a node with just 2-3 blocks first

💡 **Test Reordering**: Drag blocks to see how sequence changes

💡 **Try MCQ Pack Modal**: This is the coolest feature - full-page editing!

💡 **Mix Block Types**: Combine text → video → quiz for varied learning

💡 **Think Sequential**: Remember, students see these one-by-one in order

## Questions to Consider

As you test, think about:

1. **Flow**: Does the block order make sense?
2. **Variety**: Good mix of content types?
3. **Engagement**: Are blocks interactive enough?
4. **Difficulty**: Progressive challenge level?
5. **Clarity**: Clear instructions and feedback?

---

**Have fun testing! 🎉 Each node you create is a complete learning journey!**
