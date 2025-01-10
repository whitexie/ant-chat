import { getModels } from '@/api'
import { useQuery } from 'react-query'

interface Props {
  defaultValue: string
  onChange?: (e: string) => void
}

export function SelectModel(props: Props) {
  const { data: models } = useQuery<API.ChatModel[]>('models', getModels)

  if (!models)
    return ''

  return (
    <select
      value={props.defaultValue}
      onChange={e => props.onChange?.(e.target.value)}
    >
      {/* <option value={props.defaultValue}>{props.defaultValue}</option> */}

      {
        models.map(item => <option value={item.id} key={item.id}>{item.id}</option>)
      }
    </select>
  )
}
