from typing import Dict, Optional, Tuple
from .utils.Rectangle import Rectangle
from .find_best_position import find_best_position
from .find_encompassing_rectangle import find_encompassing_rectangle

# finding big and small recs for find_best_position
def perform_best_position(data: Dict) -> Tuple[Optional[float], Optional[float], Optional[float]]:
    try:
        current_group = data.get("current_group")
        parent_info = current_group.get('parentInfo')
        
        # Convert child rectangles to Rectangle objects
        small_rects = []
        for rect in current_group.get('childrenInfo', []):
            print("rect in perform_position is", rect)
            temp_r = Rectangle(
                id=int(rect['id']),
                x=float(rect['x']),
                y=float(rect['y']),
                width=float(rect['width']),
                height=float(rect['height'])
            )
            small_rects.append(temp_r)

        print("small_rects in perform_best_position is", small_rects)
        print("len of small_rects in perform_best_position is", len(small_rects))

        frame_rect = find_encompassing_rectangle(small_rects)

        if not frame_rect:
                raise ValueError("Failed to find an encompassing rectangle.")
            
        # Find best position 
        best_x, best_y = find_best_position(frame_rect, small_rects, small_rects[0].width, small_rects[0].height)
        print("best_x in perform_best_position is", best_x, best_y)

        if best_x is None or best_y is None:
            raise ValueError("Failed to find a valid position.")

        return best_x, best_y, small_rects[0].width
   
    except (ValueError, IndexError) as e:
        print(f"Error in perform_best_position: {e}")
        return None, None, None, None
