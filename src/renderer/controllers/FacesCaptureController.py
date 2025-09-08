import cv2
import sys
import os
import time

def main():
    # 인자 처리 (기본값 player1)
    player = sys.argv[1] if len(sys.argv) > 1 else "player1"
    filename = f"{player}.jpg"
    
    # 저장 경로 (현재 디렉토리 기준)
    save_path = os.path.join(os.getcwd(), filename)
    
    # 얼굴 인식기 불러오기
    cascade_path = cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
    faceClassifier = cv2.CascadeClassifier(cascade_path)
    
    if faceClassifier.empty():
        print("오류: 얼굴 인식기를 불러올 수 없습니다")
        return False
    
    # 카메라 열기 (크로스 플랫폼 호환)
    camera = cv2.VideoCapture(0)
    
    # 카메라 초기화 확인
    if not camera.isOpened():
        print("오류: 카메라를 열 수 없습니다")
        return False
    
    # 카메라 설정
    camera.set(cv2.CAP_PROP_BUFFERSIZE, 1)
    camera.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
    camera.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
    
    print(f"얼굴 인식을 시작합니다. ({player})")
    print("카메라를 보고 얼굴이 인식되면 3초 카운트다운 후 촬영됩니다.")
    print("ESC 키를 누르면 종료됩니다.")
    
    # 상태 변수들
    captured = False
    countdown_active = False
    countdown_start_time = None
    countdown_duration = 3  # 3초 카운트다운
    face_detected_time = None
    face_stable_duration = 0.5  # 얼굴이 0.5초간 안정적으로 감지되어야 카운트다운 시작
    
    try:
        while not captured:            
            ret, frame = camera.read()
            if not ret:
                print("카메라에서 프레임을 읽을 수 없습니다")
                time.sleep(0.1)
                continue
            
            # 화면 좌우 반전 (거울 효과)
            frame = cv2.flip(frame, 1)
            
            # 흑백 변환 + 얼굴 탐지
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            faces = faceClassifier.detectMultiScale(
                gray, 
                scaleFactor=1.1, 
                minNeighbors=5, 
                minSize=(120, 120),  # 최소 크기
                maxSize=(400, 400)   # 최대 크기 제한
            )
            
            # 화면에 표시할 프레임 복사
            display_frame = frame.copy()
            current_time = time.time()
            
            if len(faces) > 0:
                # 가장 큰 얼굴 선택 (가장 가까운 얼굴)
                largest_face = max(faces, key=lambda f: f[2] * f[3])
                x, y, w, h = largest_face
                
                # 얼굴 품질 체크
                face_area = w * h
                face_img = frame[y:y+h, x:x+w]
                face_gray = cv2.cvtColor(face_img, cv2.COLOR_BGR2GRAY)
                laplacian_var = cv2.Laplacian(face_gray, cv2.CV_64F).var()
                
                # 품질 좋은 얼굴인지 확인
                if face_area > 14400 and laplacian_var > 100:
                    # 얼굴 영역 표시 (녹색 사각형)
                    cv2.rectangle(display_frame, (x, y), (x+w, y+h), (0, 255, 0), 3)
                    
                    # 얼굴이 처음 감지된 시간 기록
                    if face_detected_time is None:
                        face_detected_time = current_time
                    
                    # 얼굴이 안정적으로 감지된 시간 계산
                    stable_time = current_time - face_detected_time
                    
                    # 카운트다운이 활성화되지 않았고, 얼굴이 충분히 안정적으로 감지된 경우
                    if not countdown_active and stable_time >= face_stable_duration:
                        countdown_active = True
                        countdown_start_time = current_time
                        print("얼굴이 인식되었습니다! 카운트다운을 시작합니다...")
                    
                    # 카운트다운 진행
                    if countdown_active:
                        elapsed_time = current_time - countdown_start_time
                        remaining_time = countdown_duration - elapsed_time
                        
                        if remaining_time > 0:
                            # 카운트다운 숫자 표시
                            countdown_number = int(remaining_time) + 1
                            
                            # 큰 카운트다운 텍스트
                            text = str(countdown_number)
                            font_scale = 3
                            thickness = 8
                            
                            # 텍스트 크기 계산
                            (text_width, text_height), _ = cv2.getTextSize(text, cv2.FONT_HERSHEY_SIMPLEX, font_scale, thickness)
                            text_x = (display_frame.shape[1] - text_width) // 2
                            text_y = (display_frame.shape[0] + text_height) // 2
                            
                            # 카운트다운 색상 (빨강에서 노랑으로)
                            if countdown_number <= 1:
                                color = (0, 0, 255)  # 빨강
                            elif countdown_number <= 2:
                                color = (0, 165, 255)  # 주황
                            else:
                                color = (0, 255, 255)  # 노랑
                            
                            # 텍스트 배경 (검은색 반투명)
                            overlay = display_frame.copy()
                            cv2.rectangle(overlay, 
                                        (text_x - 20, text_y - text_height - 10), 
                                        (text_x + text_width + 20, text_y + 20), 
                                        (0, 0, 0), -1)
                            cv2.addWeighted(overlay, 0.7, display_frame, 0.3, 0, display_frame)
                            
                            # 카운트다운 숫자 표시
                            cv2.putText(display_frame, text, (text_x, text_y), 
                                       cv2.FONT_HERSHEY_SIMPLEX, font_scale, color, thickness)
                            
                            # 상단에 안내 메시지
                            cv2.putText(display_frame, "Get Ready!", 
                                       (display_frame.shape[1]//2 - 80, 50), 
                                       cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
                        else:
                            # 카운트다운 완료 - 사진 촬영
                            # 플래시 효과
                            flash_frame = display_frame.copy()
                            flash_frame[:] = (255, 255, 255)  # 흰색으로 채움
                            cv2.imshow(f'Face Capture - {player}', flash_frame)
                            cv2.waitKey(100)  # 0.1초간 플래시 효과
                            
                            # 파일 저장
                            if cv2.imwrite(save_path, face_img):
                                print(f"✓ 얼굴 캡처 완료: {save_path}")
                                print(f"  - 크기: {w}x{h}")
                                print(f"  - 선명도: {laplacian_var:.1f}")
                                captured = True
                            else:
                                print(f"오류: 파일 저장 실패 - {save_path}")
                                countdown_active = False
                                countdown_start_time = None
                                face_detected_time = None
                    else:
                        # 안정화 대기 중
                        remaining_stable_time = face_stable_duration - stable_time
                        cv2.putText(display_frame, f"Face detected - Hold still ({remaining_stable_time:.1f}s)", 
                                   (x, y-10), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 255), 2)
                else:
                    # 품질이 좋지 않은 얼굴
                    cv2.rectangle(display_frame, (x, y), (x+w, y+h), (0, 0, 255), 2)
                    
                    if face_area <= 14400:
                        cv2.putText(display_frame, "Face too small - Move closer", 
                                   (x, y-10), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 255), 2)
                    else:
                        cv2.putText(display_frame, "Too blurry - Hold steady", 
                                   (x, y-10), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 255), 2)
                    
                    # 상태 초기화
                    face_detected_time = None
                    countdown_active = False
                    countdown_start_time = None
            else:
                # 얼굴이 없을 때
                cv2.putText(display_frame, "No face detected - Look at camera", 
                           (50, 50), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 0, 255), 2)
                
                # 상태 초기화
                face_detected_time = None
                countdown_active = False
                countdown_start_time = None
            
            # 화면 표시
            cv2.imshow(f'Face Capture - {player}', display_frame)
            
            # 키보드 입력 체크
            key = cv2.waitKey(1) & 0xFF
            if key == 27:  # ESC 키
                print("사용자가 취소했습니다")
                break
            elif key == ord('r'):  # 'r' 키로 리셋
                print("카운트다운을 리셋합니다")
                face_detected_time = None
                countdown_active = False
                countdown_start_time = None
    
    except KeyboardInterrupt:
        print("\n프로그램이 중단되었습니다")
    
    except Exception as e:
        print(f"예상치 못한 오류가 발생했습니다: {e}")
    
    finally:
        # 리소스 정리
        camera.release()
        cv2.destroyAllWindows()
    
    return captured

if __name__ == "__main__":
    success = main()
    if success:
        print("얼굴 캡처가 성공적으로 완료되었습니다!")
        sys.exit(0)
    else:
        print("얼굴 캡처를 완료하지 못했습니다.")
        sys.exit(1)