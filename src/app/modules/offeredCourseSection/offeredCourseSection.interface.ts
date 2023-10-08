export type ICreateOfferedCourseSection = {
    title: string;
    maxCapacity: number;
    offeredCourseId: string;
}

export type IOfferedCourseSectionFilters = {
    searchTerm?: string | undefined;
    offeredCourseId?: string | undefined;
}