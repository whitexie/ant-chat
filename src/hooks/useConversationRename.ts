import { useImmerReducer } from 'use-immer'

const RenameInitialState = {
  isRenameModalOpen: false,
  newName: '',
  renameId: '',
}

interface StartRenameAction {
  type: 'startRename'
  id: string
  title: string
}

interface EndRenameAction {
  type: 'endRename'
}
interface changeRenameAction {
  type: 'changeRename'
  title: string
}

type RenameReducerAction = StartRenameAction | EndRenameAction | changeRenameAction | changeRenameAction

function renameReducer(draft: typeof RenameInitialState, action: RenameReducerAction) {
  switch (action.type) {
    case 'startRename': {
      draft.isRenameModalOpen = true
      draft.renameId = action.id
      draft.newName = action.title
      break
    }
    case 'endRename': {
      draft.isRenameModalOpen = false
      draft.renameId = ''
      draft.newName = ''
      break
    }

    case 'changeRename': {
      draft.newName = action.title
      break
    }
  }
}

export function useConversationRename() {
  const [state, dispatch] = useImmerReducer(renameReducer, RenameInitialState)

  function openRenameModal(id: string, title: string) {
    dispatch({ type: 'startRename', id, title })
  }

  function closeRenameModal() {
    dispatch({ type: 'endRename' })
  }

  function changeRename(title: string) {
    dispatch({ type: 'changeRename', title })
  }

  return {
    ...state,
    openRenameModal,
    closeRenameModal,
    changeRename,
  }
}
