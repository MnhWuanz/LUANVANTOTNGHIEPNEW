import React, { useState } from 'react';
import { Button, Avatar, Tooltip, message } from 'antd';
import { PlayCircleOutlined, PauseCircleOutlined, CheckCircleOutlined, CheckOutlined, CloseOutlined, VideoCameraOutlined } from '@ant-design/icons';

export const AttendanceMonitor: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [presentCount, setPresentCount] = useState(45);
  const [pendingCount, setPendingCount] = useState(3);
  
  // Realtime logs with interactive states
  const [students, setStudents] = useState([
    {
      id: '20020003',
      name: 'Trần Thị C',
      time: '07:15:22',
      status: 'pending',
      accuracy: '85%',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDo7JpLPLqZXqUNr942aq2frOxk6muyEtuyAhUKV9jty44kYDLxLBqX782z3I1GI6dktwfkzsjs8zQ4VSBoCE88COsOUVTZP8bEb5Kj0tpcWHsG4hNI8F36o2XWP9clklByVuhFV_hjYncvKAEkwwXz6DnQVkNlyRe9V-12YIveUuB1bbD7YSIMD0kL4rmuKlCKhqEj12Znq6iMghV-O3XXVjJJi5HYoNiW8K57d3pH4HM0uTyWfLLJVzeEfM2aPD05O8pBZExDbkjZ'
    },
    {
      id: '20020002',
      name: 'Bùi Văn B',
      time: '07:14:45',
      status: 'present',
      accuracy: '98%',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBATq-LQ03XbKLdACpVjnNN6DQSA9LkB5nFIfV8JhphBkt5H35pVlluLGdunkxeeyJLpi56GaqislmQlXHrbfQX9_DK_w_IeG8csezIM6gt58u5LVKW77T9MMFu3hJw7AtF_oXWK3OFolunlOCxbmvbYp7kuTJkpMkcvIvSPlkvy_bDzVTa8U7p9Vq25jPo_pMF6Hc5saYCAcYsKzCHo6645LMbl__Y4lqmQOMBnhhYacH-QnIvE6esPQ2Pp6If1GWvpGLDdILIA4TI'
    },
    {
      id: '20020004',
      name: 'Lê Quang D',
      time: '07:12:10',
      status: 'present',
      accuracy: '96%',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCjhYsRIxBhW3qWNjADUYv1SS38eZf83rZVO8wJkWMUtogQVe9r0R2hPwrQO0ZLkZgrbaNTKuPU7Z29GaiFIV7VJZM4YjK7vhahMPaS1g427LG4i6uguCpOjkqkTO8EmJM1bvNpvHRwJN_9KYA9B_xEUo3dIpwKWGyfAvHGWRABEWzpRnzI0RKW5foLW2HwECEV6MHp4UsYUMvXCXFdeQdXeNQJLQWcu_EdJwfKb8VgnHh01hv8_ymz5iG58-YtWnd11Ov5IazMXXTn'
    },
    {
      id: '20020005',
      name: 'Phạm Thị E',
      time: '07:05:30',
      status: 'present',
      accuracy: '97%',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAUkuZ74NL8wFxZKQrmb7l565MHHYXj_FzmEjrhS8aDwRS95k9omJoWiIkwq82xRceCHRgSVJDNVP78tml_XYmu5H88IZQrGoxH-CysxJqb0FAZZw9ftz6UvilLieLRDqmFIvEycul0pI8R3aMrVpGDhIbtEZ6dMAD1OF0lOGZj43CxI9uCd9rdLGMZOcgC-Mt-kTJJyEqKGKNdm3dJvnmCVKUsGIGWQ8fLbEfNC1z2HyS37GXYisKDWnGhAbrM2l-DK2C5A-o6-ZB-'
    }
  ]);

  const handleApprove = (id: string, name: string) => {
    setStudents(prev => prev.map(student => {
      if (student.id === id) {
        return { ...student, status: 'present' };
      }
      return student;
    }));
    setPresentCount(prev => prev + 1);
    setPendingCount(prev => Math.max(0, prev - 1));
    message.success(`Đã duyệt điểm danh cho sinh viên ${name} thành công.`);
  };

  const handleReject = (id: string, name: string) => {
    setStudents(prev => prev.filter(student => student.id !== id));
    setPendingCount(prev => Math.max(0, prev - 1));
    message.warning(`Đã từ chối điểm danh cho sinh viên ${name}.`);
  };

  const handleApproveAll = () => {
    let count = 0;
    setStudents(prev => prev.map(student => {
      if (student.status === 'pending') {
        count++;
        return { ...student, status: 'present' };
      }
      return student;
    }));
    if (count > 0) {
      setPresentCount(prev => prev + count);
      setPendingCount(0);
      message.success(`Đã duyệt hàng loạt ${count} sinh viên thành công.`);
    } else {
      message.info('Không có sinh viên nào đang chờ duyệt.');
    }
  };

  return (
    <div className="space-y-6 text-left">
      
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-on-surface font-bold">Theo dõi điểm danh</h2>
          <p className="font-body-md text-body-md text-on-surface-variant">Lớp: INT3306_1 - Lập trình Web | Ca: Sáng (07:00 - 09:00)</p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <Button
            onClick={() => {
              setIsPlaying(!isPlaying);
              message.info(isPlaying ? 'Đã tạm dừng luồng camera.' : 'Đã bắt đầu luồng nhận diện camera.');
            }}
            icon={isPlaying ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
            className="flex-1 sm:flex-none py-2.5 h-auto rounded-lg font-semibold text-sm border-outline-variant hover:text-primary hover:border-primary/50 text-on-surface flex items-center justify-center gap-2"
          >
            {isPlaying ? 'Tạm dừng' : 'Tiếp tục'}
          </Button>
          <Button
            type="primary"
            icon={<CheckCircleOutlined />}
            onClick={handleApproveAll}
            className="flex-1 sm:flex-none py-2.5 h-auto bg-primary hover:bg-primary-container border-transparent rounded-lg font-semibold text-sm hover:shadow active:scale-95 duration-150 flex items-center justify-center gap-2"
          >
            Duyệt tất cả
          </Button>
        </div>
      </div>

      {/* Grid: Camera & Stats vs Logs List */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* Left Column: Camera and Statistics */}
        <div className="xl:col-span-5 flex flex-col gap-6">
          
          {/* Camera View Box */}
          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/60 shadow-soft-card overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-outline-variant/50 flex justify-between items-center bg-surface-container-lowest">
              <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface flex items-center gap-2">
                <VideoCameraOutlined className="text-primary text-[20px]" />
                Luồng Camera (Cửa A)
              </h3>
              <span className="flex h-3 w-3 relative">
                {isPlaying ? (
                  <>
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-error opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-error"></span>
                  </>
                ) : (
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-on-surface-variant/40"></span>
                )}
              </span>
            </div>

            {/* Video feed viewport */}
            <div className="relative aspect-video bg-inverse-surface w-full flex items-center justify-center overflow-hidden">
              <img
                alt="Camera feed showing students"
                className={`object-cover w-full h-full transition-opacity duration-500 ${isPlaying ? 'opacity-85' : 'opacity-40 grayscale'}`}
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCvecLd5CTqqncx1hvVl3qRJTJQF47kMlfOiZuoGUnwg-vzN58wtXl8zrdzjc3Jnc77j5_yDtCdZbJq-qPESrdqTqcC-GwKNCvx7c3cO2jZM3YCjHsFaChlyvziIwaxqWvdm9OwbTTwyD28AHs4Hd8Q2_ZttV1E4LST9O7gNaTdkYnc4gW36zrIB-OKT-v5hSJbf0KA3Dp-4Q6jktGenWxBxSFVmiZgbOc4KmohqfTH-yPGyNOAWmlSe44KJ-4KBISkN7LB0E5uA1P5"
              />

              {/* Facial recognition boxes overlays */}
              {isPlaying && (
                <>
                  <div className="absolute top-[30%] left-[45%] w-16 h-20 border-2 border-secondary rounded-lg bg-secondary/15 flex flex-col justify-end p-1 transition-all">
                    <span className="bg-secondary text-white text-[9px] font-bold px-1 py-0.5 rounded-md truncate text-center leading-none">
                      98% Bùi Văn B
                    </span>
                  </div>
                  <div className="absolute top-[40%] left-[20%] w-14 h-18 border-2 border-tertiary rounded-lg bg-tertiary/15 flex flex-col justify-end p-1 transition-all">
                    <span className="bg-tertiary text-white text-[9px] font-bold px-1 py-0.5 rounded-md truncate text-center leading-none">
                      Đang phân tích
                    </span>
                  </div>
                </>
              )}

              {/* Floating overlay status indicator */}
              <div className="absolute bottom-4 left-4 bg-background/85 backdrop-blur-sm px-3.5 py-2 rounded-lg border border-outline-variant/60 flex items-center gap-2 shadow">
                <span className={`material-symbols-outlined text-[16px] ${isPlaying ? 'text-secondary animate-pulse' : 'text-on-surface-variant'}`}>
                  {isPlaying ? 'check_circle' : 'motion_photos_paused'}
                </span>
                <span className="text-xs font-semibold text-on-surface">
                  {isPlaying ? 'Đang ghi hình & nhận diện' : 'Luồng ghi hình tạm dừng'}
                </span>
              </div>
            </div>
          </div>

          {/* Quick stats grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Present stats card */}
            <div className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/50 shadow-soft-card flex flex-col justify-between">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Có mặt</span>
                <span className="material-symbols-outlined text-secondary bg-secondary/10 p-2 rounded-lg text-[18px]">
                  how_to_reg
                </span>
              </div>
              <div className="flex items-baseline gap-2 mt-2">
                <h4 className="font-display-lg text-display-lg text-on-surface font-bold leading-none">{presentCount}</h4>
                <span className="text-xs text-on-surface-variant font-semibold">/ 60</span>
              </div>
              <div className="w-full bg-surface-container-high h-1.5 mt-4 rounded-full overflow-hidden">
                <div
                  className="bg-secondary h-full rounded-full transition-all duration-500"
                  style={{ width: `${(presentCount / 60) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Pending approval stats card */}
            <div className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/50 shadow-soft-card flex flex-col justify-between">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Chờ duyệt</span>
                <span className="material-symbols-outlined text-tertiary bg-tertiary/10 p-2 rounded-lg text-[18px]">
                  pending_actions
                </span>
              </div>
              <div className="flex items-baseline gap-2 mt-2">
                <h4 className="font-display-lg text-display-lg text-on-surface font-bold leading-none">{pendingCount}</h4>
              </div>
              <p className="text-[10px] text-tertiary font-bold mt-4 bg-tertiary/10 inline-block px-2.5 py-1 rounded-md border border-tertiary/10 w-max leading-none">
                Cần xác nhận thủ công
              </p>
            </div>
          </div>

        </div>

        {/* Right Column: Real-time recognition list */}
        <div className="xl:col-span-7 bg-surface-container-lowest rounded-2xl border border-outline-variant/60 shadow-soft-card flex flex-col h-[600px] overflow-hidden">
          <div className="px-6 py-4 border-b border-outline-variant/50 flex justify-between items-center bg-surface-container-lowest">
            <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">Luồng nhận diện thời gian thực</h3>
            <div className="flex gap-2">
              <Button
                type="text"
                size="small"
                icon={<span className="material-symbols-outlined text-[18px]">filter_list</span>}
                className="text-primary hover:bg-primary-container/10 rounded-lg flex items-center justify-center p-2 h-auto"
              />
              <Button
                type="text"
                size="small"
                icon={<span className="material-symbols-outlined text-[18px]">more_vert</span>}
                className="text-on-surface-variant hover:bg-surface-container-low rounded-lg flex items-center justify-center p-2 h-auto"
              />
            </div>
          </div>

          {/* Table Headers */}
          <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-surface-container border-b border-outline-variant/50 text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
            <div className="col-span-5 sm:col-span-4">Sinh viên</div>
            <div className="col-span-3 hidden sm:block">Thời gian</div>
            <div className="col-span-4 sm:col-span-3 text-center">Trạng thái</div>
            <div className="col-span-3 sm:col-span-2 text-right">Hành động</div>
          </div>

          {/* Scrollable list content */}
          <div className="flex-1 overflow-y-auto divide-y divide-outline-variant/30">
            {students.length === 0 ? (
              <div className="py-20 text-center text-on-surface-variant">
                <span className="material-symbols-outlined text-[48px] opacity-35">inbox</span>
                <p className="mt-2 text-sm font-medium">Không có nhật ký nhận diện nào</p>
              </div>
            ) : (
              students.map((student) => (
                <div
                  key={student.id}
                  className={`grid grid-cols-12 gap-4 px-6 py-4 items-center transition-all ${
                    student.status === 'pending'
                      ? 'bg-tertiary-container/5 hover:bg-tertiary-container/10'
                      : 'hover:bg-surface-container-low/50'
                  }`}
                >
                  {/* Avatar and name */}
                  <div className="col-span-5 sm:col-span-4 flex items-center gap-3">
                    <Avatar
                      src={student.avatar}
                      size={40}
                      className="border-2 border-surface shadow-sm object-cover"
                    />
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-on-surface truncate leading-normal">{student.name}</p>
                      <p className="text-xs text-on-surface-variant truncate font-medium">{student.id}</p>
                    </div>
                  </div>

                  {/* Time stamp */}
                  <div className="col-span-3 hidden sm:block text-xs font-semibold text-on-surface-variant/80">
                    {student.time}
                  </div>

                  {/* Recognition Status pill */}
                  <div className="col-span-4 sm:col-span-3 flex justify-center">
                    {student.status === 'pending' ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-tertiary/10 text-tertiary border border-tertiary/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-tertiary animate-pulse"></span>
                        Pending ({student.accuracy})
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-secondary/10 text-secondary border border-secondary/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                        Có mặt
                      </span>
                    )}
                  </div>

                  {/* Actions buttons */}
                  <div className="col-span-3 sm:col-span-2 flex justify-end gap-1.5">
                    {student.status === 'pending' ? (
                      <>
                        <Tooltip title="Chấp thuận">
                          <Button
                            type="text"
                            size="small"
                            shape="circle"
                            onClick={() => handleApprove(student.id, student.name)}
                            icon={<CheckOutlined />}
                            className="text-secondary hover:bg-secondary/10 flex items-center justify-center p-1.5"
                          />
                        </Tooltip>
                        <Tooltip title="Từ chối">
                          <Button
                            type="text"
                            size="small"
                            shape="circle"
                            onClick={() => handleReject(student.id, student.name)}
                            icon={<CloseOutlined />}
                            className="text-error hover:bg-error/10 flex items-center justify-center p-1.5"
                          />
                        </Tooltip>
                      </>
                    ) : (
                      <Button
                        type="text"
                        size="small"
                        icon={<span className="material-symbols-outlined text-[18px]">more_horiz</span>}
                        className="text-on-surface-variant hover:bg-surface-container-high rounded flex items-center justify-center"
                      />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
export default AttendanceMonitor;
