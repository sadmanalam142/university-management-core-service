import { RedisClient } from "../../../shared/redis";
import { EVENT_STUDENT_CREATED, EVENT_STUDENT_DELETED, EVENT_STUDENT_UPDATED } from "./student.constant";
import { StudentService } from "./student.service";

const initStudentEvents = () => {
    RedisClient.subscribe(EVENT_STUDENT_CREATED, async (e: string) => {
        const data = JSON.parse(e);
        await StudentService.createStudentFromEvent(data);
    });

    RedisClient.subscribe(EVENT_STUDENT_UPDATED, async (e: string) => {
        const data = JSON.parse(e);
        await StudentService.updateStudentFromEvent(data);
    });

    RedisClient.subscribe(EVENT_STUDENT_DELETED, async (e: string) => {
        const data = JSON.parse(e);
        await StudentService.deleteStudentFromEvent(data.id);
    });
    
};

export default initStudentEvents;