/**
 * CalendarView Component
 *
 * Visual monthly calendar for scheduled blog posts and content planning.
 * Shows all scheduled posts with status badges and click-to-edit functionality.
 */

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, FileText } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek } from 'date-fns';

/**
 * Get status badge variant
 */
const getStatusVariant = (status) => {
  switch (status) {
    case 'Draft': return 'secondary';
    case 'Needs Review': return 'outline';
    case 'Approved': return 'default';
    case 'Scheduled': return 'secondary';
    case 'Published': return 'default';
    default: return 'secondary';
  }
};

/**
 * CalendarView Component
 */
export default function CalendarView({ posts, onPostSelect }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Get calendar days for current month
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);

    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  }, [currentMonth]);

  // Get posts for specific day
  const getPostsForDay = (day) => {
    return posts.filter(post => {
      if (!post.scheduled_date) return false;
      const scheduledDate = new Date(post.scheduled_date);
      return isSameDay(scheduledDate, day);
    });
  };

  // Navigate months
  const previousMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const goToToday = () => setCurrentMonth(new Date());

  const today = new Date();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-primary" />
            Content Calendar
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={goToToday}>
              Today
            </Button>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" onClick={previousMonth}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm font-semibold min-w-[120px] text-center">
                {format(currentMonth, 'MMMM yyyy')}
              </span>
              <Button variant="ghost" size="icon" onClick={nextMonth}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Day Headers */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div
              key={day}
              className="text-center text-xs font-semibold text-muted-foreground py-2 border-b"
            >
              {day}
            </div>
          ))}

          {/* Calendar Days */}
          {calendarDays.map((day, index) => {
            const dayPosts = getPostsForDay(day);
            const isToday = isSameDay(day, today);
            const isCurrentMonth = isSameMonth(day, currentMonth);

            return (
              <div
                key={index}
                className={`min-h-[100px] border rounded-lg p-2 transition-all ${
                  isCurrentMonth ? 'bg-background' : 'bg-muted/30'
                } ${isToday ? 'border-primary border-2' : 'border-border'} hover:border-primary/50`}
              >
                {/* Day Number */}
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`text-xs font-medium ${
                      isToday
                        ? 'bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center'
                        : isCurrentMonth
                        ? 'text-foreground'
                        : 'text-muted-foreground'
                    }`}
                  >
                    {format(day, 'd')}
                  </span>
                  {dayPosts.length > 0 && (
                    <Badge variant="outline" className="text-xs h-5">
                      {dayPosts.length}
                    </Badge>
                  )}
                </div>

                {/* Posts for this day */}
                <div className="space-y-1">
                  {dayPosts.slice(0, 3).map((post) => (
                    <button
                      key={post.id}
                      onClick={() => onPostSelect(post)}
                      className="w-full text-left p-1 rounded bg-primary/10 hover:bg-primary/20 transition-colors group"
                    >
                      <div className="flex items-start gap-1">
                        <FileText className="w-3 h-3 mt-0.5 text-primary flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate group-hover:text-primary">
                            {post.title}
                          </p>
                          <Badge
                            variant={getStatusVariant(post.status)}
                            className="text-[10px] h-4 mt-0.5"
                          >
                            {post.status}
                          </Badge>
                        </div>
                      </div>
                    </button>
                  ))}

                  {/* Show "+X more" if more than 3 posts */}
                  {dayPosts.length > 3 && (
                    <div className="text-[10px] text-muted-foreground text-center py-1">
                      +{dayPosts.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-primary/10 border border-primary rounded"></div>
            <span>Scheduled Post</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-primary border-2 border-primary rounded-full"></div>
            <span>Today</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
