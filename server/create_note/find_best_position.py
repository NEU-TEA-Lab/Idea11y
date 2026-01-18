from typing import List, Optional, Tuple
from .utils.Rectangle import Rectangle


def calculate_distance(x1: float, y1: float, x2: float, y2: float) -> float:
    """Calculate Euclidean distance between two points."""
    return ((x1 - x2) ** 2 + (y1 - y2) ** 2) ** 0.5


def check_overlap(x: float, y: float, width: float, height: float, rect: Rectangle) -> bool:
    """Check if a rectangle at (x,y) with given width/height overlaps with another rectangle."""
    return not (x + width <= rect.x or
                x >= rect.x + rect.width or
                y + height <= rect.y or
                y >= rect.y + rect.height)


def find_best_position(big_rect: Rectangle, small_rects: List[Rectangle], new_width: float, new_height: float) -> Tuple[Optional[float], Optional[float]]:
    try:
        # Input validation
        if not isinstance(big_rect, Rectangle):
            raise ValueError("'big_rect' must be an instance of Rectangle")

        if not isinstance(small_rects, list) or any(not isinstance(rect, Rectangle) for rect in small_rects):
            raise ValueError("'small_rects' must be a list of Rectangle instances")

        if new_width <= 0 or new_height <= 0:
            raise ValueError("'new_width' and 'new_height' must be positive values")

        # First try to find space inside the big rectangle
        free_rects: List[Rectangle] = [big_rect]

        for rect in small_rects:
            new_free_rects: List[Rectangle] = []
            for free_rect in free_rects:
                if (rect.x < free_rect.x + free_rect.width and
                    rect.x + rect.width > free_rect.x and
                    rect.y < free_rect.y + free_rect.height and
                        rect.y + rect.height > free_rect.y):

                    if rect.x > free_rect.x:
                        new_free_rects.append(Rectangle(
                            id=None,
                            x=free_rect.x, y=free_rect.y,
                            width=rect.x - free_rect.x, height=free_rect.height))

                    if rect.x + rect.width < free_rect.x + free_rect.width:
                        new_free_rects.append(Rectangle(
                            id=None,
                            x=rect.x + rect.width, y=free_rect.y,
                            width=free_rect.x + free_rect.width - (rect.x + rect.width), height=free_rect.height))

                    if rect.y > free_rect.y:
                        new_free_rects.append(Rectangle(
                            id=None,
                            x=free_rect.x, y=free_rect.y,
                            width=free_rect.width, height=rect.y - free_rect.y))

                    if rect.y + rect.height < free_rect.y + free_rect.height:
                        new_free_rects.append(Rectangle(
                            id=None,
                            x=free_rect.x, y=rect.y + rect.height,
                            width=free_rect.width, height=free_rect.y + free_rect.height - (rect.y + rect.height)))
                else:
                    new_free_rects.append(free_rect)

            free_rects = new_free_rects

        # Try to find space inside first
        best_rect = min(
            (rect for rect in free_rects if rect.width >= new_width and rect.height >= new_height),
            key=lambda r: r.width * r.height,
            default=None
        )

        if best_rect:
            return best_rect.x, best_rect.y

        # If no space inside, find the closest valid position outside
        # Define search boundaries (extend beyond the big rectangle)
        margin = 10  # Distance to start searching beyond the big rectangle
        search_radius = 100  # How far to search beyond the big rectangle

        best_distance = float('inf')
        best_position = (None, None)

        # Check positions around the big rectangle
        test_positions = [
            # Top edge
            (big_rect.x, big_rect.y - new_height - margin),
            # Bottom edge
            (big_rect.x, big_rect.y + big_rect.height + margin),
            # Left edge
            (big_rect.x - new_width - margin, big_rect.y),
            # Right edge
            (big_rect.x + big_rect.width + margin, big_rect.y),
            # Corners
            (big_rect.x - new_width - margin, big_rect.y - new_height - margin),
            (big_rect.x + big_rect.width + margin, big_rect.y - new_height - margin),
            (big_rect.x - new_width - margin, big_rect.y + big_rect.height + margin),
            (big_rect.x + big_rect.width + margin, big_rect.y + big_rect.height + margin)
        ]

        for test_x, test_y in test_positions:
            # Check if this position overlaps with any existing rectangles
            valid_position = True
            for rect in small_rects:
                if check_overlap(test_x, test_y, new_width, new_height, rect):
                    valid_position = False
                    break

            if valid_position:
                # Calculate distance to the center of the big rectangle
                big_rect_center_x = big_rect.x + big_rect.width / 2
                big_rect_center_y = big_rect.y + big_rect.height / 2
                distance = calculate_distance(test_x, test_y, big_rect_center_x, big_rect_center_y)

                if distance < best_distance:
                    best_distance = distance
                    best_position = (test_x, test_y)

        return best_position

    except (ValueError, IndexError) as e:
        print(f"Error: {e}")
        return None, None
