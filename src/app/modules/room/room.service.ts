import { Prisma, Room } from '@prisma/client';
import prisma from '../../../shared/prisma';
import { IGenericResponse } from '../../../interfaces/common';
import { IPaginationOptions } from '../../../interfaces/pagination';
import { paginationHelpers } from '../../../helpers/paginationHelper';
import { IRoomFilters } from './room.interface';
import { roomRelationalFields, roomRelationalFieldsMapper, roomSearchableFields } from './room.constant';

const createRoom = async (payload: Room): Promise<Room> => {
  const result = await prisma.room.create({
    data: payload,
    include: {
      building: true,
    },
  });
  return result;
};

const getAllRooms = async (
  filters: IRoomFilters,
  options: IPaginationOptions
): Promise<IGenericResponse<Room[]>> => {
  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelpers.calculatePagination(options);
  const { searchTerm, ...filterData } = filters;
  const andConditions = [];
  
  if (searchTerm) {
    andConditions.push({
        OR: roomSearchableFields.map((field) => ({
            [field]: {
                contains: searchTerm,
                mode: 'insensitive'
            }
        }))
    });
}

if (Object.keys(filterData).length > 0) {
    andConditions.push({
        AND: Object.keys(filterData).map((key) => {
            if (roomRelationalFields.includes(key)) {
                return {
                    [roomRelationalFieldsMapper[key]]: {
                        id: (filterData as any)[key]
                    }
                };
            } else {
                return {
                    [key]: {
                        equals: (filterData as any)[key]
                    }
                };
            }
        })
    });
}

  const whereConditions: Prisma.RoomWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};
  const result = await prisma.room.findMany({
    skip,
    take: limit,
    where: whereConditions,
    include: {
      building: true,
    },
    orderBy:
      sortBy && sortOrder
        ? {
            [sortBy]: sortOrder,
          }
        : {
            createdAt: 'desc',
          },
  });

  const total = await prisma.room.count();

  return {
    meta: {
      page,
      limit,
      total,
    },
    data: result,
  };
};

const getSingleRoom = async (id: string): Promise<Room | null> => {
  const result = await prisma.room.findUnique({
    where: {
      id,
    },
    include: {
      building: true,
    },
  });
  return result;
};

const updateRoom = async (
  id: string,
  payload: Partial<Room>
): Promise<Room> => {
  const result = await prisma.room.update({
    where: {
      id,
    },
    data: payload,
    include: {
      building: true,
    },
  });
  return result;
};

const deleteRoom = async (id: string): Promise<Room> => {
  const result = await prisma.room.delete({
    where: {
      id,
    },
    include: {
      building: true,
    },
  });
  return result;
};

export const RoomService = {
  createRoom,
  getAllRooms,
  getSingleRoom,
  updateRoom,
  deleteRoom,
};
