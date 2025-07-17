import { AnimatePresence, motion } from 'motion/react'
import React from 'react'
import { SearchBar } from './SearchBar'

export function SearchContainer() {
  const [openModal, setOpenModal] = React.useState(false)

  React.useEffect(
    () => {
      const handleKeyDown = (e: KeyboardEvent) => {
        console.log('Key pressed:', e.key)
        if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
          e.preventDefault()
          setOpenModal(!openModal)
        }

        if (!openModal) {
          return
        }

        if (e.key === 'Escape' && openModal) {
          e.preventDefault()
          setOpenModal(false)
        }
      }

      window.addEventListener('keydown', handleKeyDown)

      return () => {
        window.removeEventListener('keydown', handleKeyDown)
      }
    },
  )

  return (

    <AnimatePresence>
      {
        openModal
          ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed top-0 left-0 bottom-0 right-0 z-50 bg-black/10 backdrop-blur-sm"
                onClick={(e) => {
                  if (e.target === e.currentTarget) {
                    setOpenModal(false)
                  }
                }}
              >
                <SearchBar />
              </motion.div>
            )
          : null
      }
    </AnimatePresence>

  )
}
