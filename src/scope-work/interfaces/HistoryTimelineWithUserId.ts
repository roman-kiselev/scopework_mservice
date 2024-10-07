import { ResHistoryTimeline } from './ResHistoryTimeline';

export interface HistoryTimelineWithUserId
    extends Omit<ResHistoryTimeline, 'userName'> {
    userId: number;
}
