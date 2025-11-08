import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Header } from '@/components/layout/header'
import { HeaderActions } from '@/components/layout/header-actions'
import { Search } from '@/components/search'
import { Main } from '@/components/layout/main'
import { CreateLeaveDialog } from './create-leave-dialog'
import { LeavesList } from './leaves-list'
import { WeeklyScheduleCalendar } from './weekly-schedule-calendar'

export function DoctorSchedulePage() {
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

    return (
        <>
            <Header fixed>
                <Search />
                <HeaderActions />
            </Header>

            <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
                <div className='flex flex-wrap items-end justify-between gap-2'>
                    <div>
                        <h2 className='text-2xl font-bold tracking-tight'>Lịch làm việc</h2>
                        <p className='text-muted-foreground'>Quản lý lịch làm việc và lịch nghỉ của bạn</p>
                    </div>
                </div>

                <Tabs defaultValue='leaves' className='w-full'>
                    <TabsList>
                        <TabsTrigger value='schedule'>Lịch làm việc</TabsTrigger>
                        <TabsTrigger value='leaves'>Lịch nghỉ</TabsTrigger>
                    </TabsList>

                    <TabsContent value='schedule' className='space-y-4'>
                        <Card>
                            <CardHeader>
                                <CardTitle>Lịch làm việc</CardTitle>
                                <CardDescription>Xem lịch làm việc được phân công</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <WeeklyScheduleCalendar />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value='leaves' className='space-y-4'>
                        <Card>
                            <CardHeader>
                                <div className='flex items-center justify-between'>
                                    <div>
                                        <CardTitle>Lịch nghỉ</CardTitle>
                                        <CardDescription>Quản lý các yêu cầu nghỉ phép của bạn</CardDescription>
                                    </div>
                                    <Button onClick={() => setIsCreateDialogOpen(true)}>
                                        <Plus className='mr-2 h-4 w-4' />
                                        Thêm lịch nghỉ
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <Tabs defaultValue='all'>
                                    <TabsList className='mb-4'>
                                        <TabsTrigger value='all'>Tất cả</TabsTrigger>
                                        <TabsTrigger value='pending'>Chờ duyệt</TabsTrigger>
                                        <TabsTrigger value='approved'>Đã duyệt</TabsTrigger>
                                        <TabsTrigger value='rejected'>Từ chối</TabsTrigger>
                                    </TabsList>
                                    <TabsContent value='all'>
                                        <LeavesList />
                                    </TabsContent>
                                    <TabsContent value='pending'>
                                        <LeavesList status='CHO_DUYET' />
                                    </TabsContent>
                                    <TabsContent value='approved'>
                                        <LeavesList status='DA_DUYET' />
                                    </TabsContent>
                                    <TabsContent value='rejected'>
                                        <LeavesList status='TU_CHOI' />
                                    </TabsContent>
                                </Tabs>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                <CreateLeaveDialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen} />
            </Main>
        </>
    )
}
