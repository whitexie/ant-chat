import { EmojiPicker } from '@ferrucc-io/emoji-picker'
import { Button, Popover } from 'antd'
import React from 'react'

export interface EmojiPickerProps {
  value?: string
  onChange?: (e: string) => void
}

export function EmojiPickerHoc({ value, onChange }: EmojiPickerProps) {
  const [open, setOpen] = React.useState(false)
  function handleEmojiSelect(e: string) {
    onChange?.(e)
    setOpen(false)
  }

  return (
    <Popover
      open={open}
      trigger="click"
      placement="rightTop"
      content={(
        <div className="">
          <EmojiPicker className="border-black/10 dark:border-white/20" onEmojiSelect={handleEmojiSelect}>
            <EmojiPicker.Header>
              <EmojiPicker.Input placeholder="Search emoji" />
            </EmojiPicker.Header>
            <EmojiPicker.Group>
              <EmojiPicker.List containerHeight={200} />
            </EmojiPicker.Group>
          </EmojiPicker>
        </div>
      )}
      onOpenChange={(open) => {
        setOpen(open)
      }}
    >
      <Button icon={value} onClick={() => setOpen(true)} />
    </Popover>
  )
}

// export function EmojiPicker({ value, onChange }: EmojiPickerProps) {
//   // const theme = useThemeStore(state => state.theme)
//   const [open, setOpen] = React.useState(false)
//   return (
//     <Popover
//       open={open}
//       trigger="click"
//       placement="rightTop"
//       content={(
//         <_EmojiPicker
//           theme={Theme.AUTO}
//           categories={[
//             { category: Categories.ANIMALS_NATURE, name: 'animals-nature' },
//             { category: Categories.ACTIVITIES, name: 'activities' },
//             { category: Categories.FOOD_DRINK, name: 'food-drink' },
//             { category: Categories.TRAVEL_PLACES, name: 'travel-places' },
//             { category: Categories.OBJECTS, name: 'objects' },
//             { category: Categories.SYMBOLS, name: 'symbols' },
//             { category: Categories.FLAGS, name: 'flags' },
//           ]}
//           searchDisabled={false}
//           skinTonesDisabled={true}
//           lazyLoadEmojis={true}
//           previewConfig={{
//             showPreview: false,
//           }}
//           onEmojiClick={(e) => {
//             console.log('click emoji => ', e)
//             onChange?.(e.emoji)
//             setOpen(false)
//           }}
//         />
//       )}
//     >
//       <Button onClick={() => {
//         setOpen(true)
//       }}
//       >
//         {value}
//       </Button>
//     </Popover>

//   )
// }
