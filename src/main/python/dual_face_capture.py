import cv2
import sys
import os
import time
import json


def main():
    player1_name = sys.argv[1] if len(sys.argv) > 1 else "player1"
    player2_name = sys.argv[2] if len(sys.argv) > 2 else "player2"
    
    base_dir = os.path.join(os.path.dirname(__file__), "..", "..", "renderer", "assets", "playerPhotos")
    os.makedirs(base_dir, exist_ok=True)
    
    player1_path = os.path.abspath(os.path.join(base_dir, f"{player1_name}.jpg"))
    player2_path = os.path.abspath(os.path.join(base_dir, f"{player2_name}.jpg"))

    # 얼굴 인식기 불러오기
    cascadePath = cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
    faceClassifier = cv2.CascadeClassifier(cascadePath)
    
    if faceClassifier.empty():
        print("오류: 얼굴 인식기를 불러올 수 없습니다")
        return False, None, None
    
    # 카메라 열기
    camera = cv2.VideoCapture(0)
    
    if not camera.isOpened():
        print("오류: 카메라를 열 수 없습니다")
        return False, None, None
    
    # 카메라 설정
    camera.set(cv2.CAP_PROP_BUFFERSIZE, 1)
    camera.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)  # 더 넓은 해상도로 설정
    camera.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)
    
    print(f"두 명의 얼굴 인식을 시작합니다. ({player1_name}, {player2_name})")
    print("두 사람이 나란히 서서 카메라를 보세요.")
    print("좌측 = Player1, 우측 = Player2")
    print("두 얼굴이 모두 인식되면 3초 카운트다운 후 촬영됩니다.")
    print("ESC 키를 누르면 종료됩니다.")
    
    # 상태 변수들
    captured = False
    countdown_active = False
    countdown_start_time = None
    countdown_duration = 3
    faces_detected_time = None
    faces_stable_duration = 1.0  # 두 얼굴 모두 1초간 안정적으로 감지되어야 함
    
    try:
        while not captured:
            ret, frame = camera.read()
            if not ret:
                print("카메라에서 프레임을 읽을 수 없습니다")
                time.sleep(0.1)
                continue
            
            # 화면 좌우 반전 (거울 효과)
            frame = cv2.flip(frame, 1)
            frame_height, frame_width = frame.shape[:2]
            frame_center = frame_width // 2
            
            # 흑백 변환 + 얼굴 탐지
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            faces = faceClassifier.detectMultiScale(
                gray, 
                scaleFactor=1.1, 
                minNeighbors=5, 
                minSize=(100, 100),
                maxSize=(300, 300)
            )
            
            # 화면에 표시할 프레임 복사
            display_frame = frame.copy()
            current_time = time.time()
            
            # 화면 중앙선 표시
            cv2.line(display_frame, (frame_center, 0), (frame_center, frame_height), (255, 255, 255), 2)
            cv2.putText(display_frame, "Player1", (50, 50), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
            cv2.putText(display_frame, "Player2", (frame_center + 50, 50), cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 0, 255), 2)
            
            # 좌우 영역별로 얼굴 분류
            left_faces = []  # Player1 (좌측)
            right_faces = [] # Player2 (우측)
            
            for (x, y, w, h) in faces:
                face_center_x = x + w // 2
                face_area = w * h
                face_img = frame[y:y+h, x:x+w]
                face_gray = cv2.cvtColor(face_img, cv2.COLOR_BGR2GRAY)
                laplacian_var = cv2.Laplacian(face_gray, cv2.CV_64F).var()
                
                # 품질 좋은 얼굴인지 확인
                if face_area > 10000 and laplacian_var > 80:
                    if face_center_x < frame_center:
                        left_faces.append((x, y, w, h, face_area, laplacian_var))
                    else:
                        right_faces.append((x, y, w, h, face_area, laplacian_var))
            
            # 각 영역에서 가장 좋은 얼굴 선택
            best_left_face = None
            best_right_face = None
            
            if left_faces:
                best_left_face = max(left_faces, key=lambda f: f[4] * f[5])  # 크기 * 선명도
            
            if right_faces:
                best_right_face = max(right_faces, key=lambda f: f[4] * f[5])
            
            # 두 얼굴이 모두 감지되었는지 확인
            both_faces_detected = best_left_face is not None and best_right_face is not None
            
            if both_faces_detected:
                # Player1 (좌측) 얼굴 표시
                x1, y1, w1, h1 = best_left_face[:4]
                cv2.rectangle(display_frame, (x1, y1), (x1+w1, y1+h1), (0, 255, 0), 3)
                cv2.putText(display_frame, "Player1", (x1, y1-10), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
                
                # Player2 (우측) 얼굴 표시
                x2, y2, w2, h2 = best_right_face[:4]
                cv2.rectangle(display_frame, (x2, y2), (x2+w2, y2+h2), (255, 0, 255), 3)
                cv2.putText(display_frame, "Player2", (x2, y2-10), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 0, 255), 2)
                
                # 두 얼굴이 처음 감지된 시간 기록
                if faces_detected_time is None:
                    faces_detected_time = current_time
                
                # 두 얼굴이 안정적으로 감지된 시간 계산
                stable_time = current_time - faces_detected_time
                
                # 카운트다운이 활성화되지 않았고, 두 얼굴이 충분히 안정적으로 감지된 경우
                if not countdown_active and stable_time >= faces_stable_duration:
                    countdown_active = True
                    countdown_start_time = current_time
                    print("두 얼굴이 모두 인식되었습니다! 카운트다운을 시작합니다...")
                
                # 카운트다운 진행
                if countdown_active:
                    elapsed_time = current_time - countdown_start_time
                    remaining_time = countdown_duration - elapsed_time
                    
                    if remaining_time > 0:
                        # 카운트다운 숫자 표시
                        countdown_number = int(remaining_time) + 1
                        
                        # 큰 카운트다운 텍스트
                        text = str(countdown_number)
                        font_scale = 4
                        thickness = 10
                        
                        # 텍스트 크기 계산
                        (text_width, text_height), _ = cv2.getTextSize(text, cv2.FONT_HERSHEY_SIMPLEX, font_scale, thickness)
                        text_x = (frame_width - text_width) // 2
                        text_y = (frame_height + text_height) // 2
                        
                        # 카운트다운 색상
                        if countdown_number <= 1:
                            color = (0, 0, 255)  # 빨강
                        elif countdown_number <= 2:
                            color = (0, 165, 255)  # 주황
                        else:
                            color = (0, 255, 255)  # 노랑
                        
                        # 텍스트 배경
                        overlay = display_frame.copy()
                        cv2.rectangle(overlay, 
                                    (text_x - 30, text_y - text_height - 20), 
                                    (text_x + text_width + 30, text_y + 30), 
                                    (0, 0, 0), -1)
                        cv2.addWeighted(overlay, 0.7, display_frame, 0.3, 0, display_frame)
                        
                        # 카운트다운 숫자 표시
                        cv2.putText(display_frame, text, (text_x, text_y), 
                                   cv2.FONT_HERSHEY_SIMPLEX, font_scale, color, thickness)
                        
                        # 상단에 안내 메시지
                        cv2.putText(display_frame, "Get Ready Both!", 
                                   (frame_width//2 - 120, 100), 
                                   cv2.FONT_HERSHEY_SIMPLEX, 1.2, (0, 255, 0), 3)
                    else:
                        # 카운트다운 완료 - 두 사진 동시 촬영
                        # 플래시 효과
                        flash_frame = display_frame.copy()
                        flash_frame[:] = (255, 255, 255)
                        cv2.imshow('Dual Face Capture', flash_frame)
                        cv2.waitKey(200)  # 0.2초간 플래시 효과
                        
                        # 두 얼굴 이미지 추출 및 저장
                        player1_face = frame[y1:y1+h1, x1:x1+w1]
                        player2_face = frame[y2:y2+h2, x2:x2+w2]
                        
                        success1 = cv2.imwrite(player1_path, player1_face)
                        success2 = cv2.imwrite(player2_path, player2_face)
                        
                        if success1 and success2:
                            print(f"✓ 두 얼굴 캡처 완료!")
                            print(f"  - {player1_name}: {player1_path} ({w1}x{h1})")
                            print(f"  - {player2_name}: {player2_path} ({w2}x{h2})")
                            captured = True
                        else:
                            print(f"오류: 파일 저장 실패")
                            countdown_active = False
                            countdown_start_time = None
                            faces_detected_time = None
                else:
                    # 안정화 대기 중
                    remaining_stable_time = faces_stable_duration - stable_time
                    cv2.putText(display_frame, f"Both faces detected - Hold still ({remaining_stable_time:.1f}s)", 
                               (frame_width//2 - 200, frame_height - 50), 
                               cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 255), 2)
            else:
                # 두 얼굴이 모두 감지되지 않은 경우
                missing_faces = []
                if best_left_face is None:
                    missing_faces.append("Player1 (left)")
                else:
                    x1, y1, w1, h1 = best_left_face[:4]
                    cv2.rectangle(display_frame, (x1, y1), (x1+w1, y1+h1), (0, 255, 0), 3)
                    cv2.putText(display_frame, "Player1 ✓", (x1, y1-10), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
                
                if best_right_face is None:
                    missing_faces.append("Player2 (right)")
                else:
                    x2, y2, w2, h2 = best_right_face[:4]
                    cv2.rectangle(display_frame, (x2, y2), (x2+w2, y2+h2), (255, 0, 255), 3)
                    cv2.putText(display_frame, "Player2 ✓", (x2, y2-10), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 0, 255), 2)
                
                # 누락된 얼굴 안내
                if missing_faces:
                    missing_text = f"Missing: {', '.join(missing_faces)}"
                    cv2.putText(display_frame, missing_text, 
                               (50, frame_height - 50), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 0, 255), 2)
                
                # 상태 초기화
                faces_detected_time = None
                countdown_active = False
                countdown_start_time = None
            
            # 화면 표시
            cv2.imshow('Dual Face Capture', display_frame)
            
            # 키보드 입력 체크
            key = cv2.waitKey(1) & 0xFF
            if key == 27:  # ESC 키
                print("사용자가 취소했습니다")
                break
            elif key == ord('r'):  # 'r' 키로 리셋
                print("카운트다운을 리셋합니다")
                faces_detected_time = None
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
    
    return captured, player1_path if captured else None, player2_path if captured else None


if __name__ == "__main__":
    success, path1, path2 = main()
    
    if success:
        # JSON 형태로 결과 반환 (Electron에서 파싱하기 쉽게)
        result = {
            "success": True,
            "player1_path": path1,
            "player2_path": path2
        }
        print(f"RESULT: {json.dumps(result)}", flush=True)
        sys.exit(0)
    else:
        result = {
            "success": False,
            "player1_path": None,
            "player2_path": None
        }
        print(f"RESULT: {json.dumps(result)}", flush=True)
        print("얼굴 캡처를 완료하지 못했습니다.", flush=True)
        sys.exit(1)