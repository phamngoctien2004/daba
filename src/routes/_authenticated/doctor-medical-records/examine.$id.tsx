import { createFileRoute } from '@tanstack/react-router'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search as GlobalSearch } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { ExaminationPage } from '@/features/medical-records/components/examination/examination-page'

type ExamineSearchParams = {
  from?: string
}

export const Route = createFileRoute(
  '/_authenticated/doctor-medical-records/examine/$id'
)({
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>): ExamineSearchParams => {
    return {
      from: typeof search.from === 'string' ? search.from : undefined,
    }
  },
})

function RouteComponent() {
  const { id } = Route.useParams()
  const { from } = Route.useSearch()

  return (
    <>
      <Header fixed>
        <GlobalSearch />
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <ExaminationPage id={id} fromRecordId={from} />
      </Main>
    </>
  )
}
