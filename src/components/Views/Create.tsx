import { Editor } from '../EditorNew/Editor'
import { ShowOnlyOnClient } from '../_shared/ShowOnlyOnClient'

export const CreateView = () => {
  return (
    <ShowOnlyOnClient>
      <Editor />
    </ShowOnlyOnClient>
  )
}

export default CreateView
