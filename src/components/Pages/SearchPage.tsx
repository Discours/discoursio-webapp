import { MainLayout } from '../Layours/MainLayout'
import { SearchView } from '../Views/Search'
import type { PageProps } from '../types'

export const SearchPage = (props: PageProps) => {
  return (
    <MainLayout>
      <SearchView results={props.searchResults || []} query={props.searchQuery} />
    </MainLayout>
  )
}

// for lazy loading
export default SearchPage
