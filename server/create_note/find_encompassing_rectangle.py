from typing import List, Optional
from .utils.Rectangle import Rectangle


def find_encompassing_rectangle(rectangles: List[Rectangle]) -> Optional[Rectangle]:
    if not rectangles:
        return None

    try:
        # Initialize min and max values for x and y coordinates
        min_x: float = float('inf')
        max_x: float = float('-inf')
        min_y: float = float('inf')
        max_y: float = float('-inf')

        # Find the minimum and maximum x, y values based on all rectangles
        for rect in rectangles:
            # Calculate the left, right, top, and bottom edges of the rectangle
            left: float = rect.x
            right: float = rect.x + rect.width
            top: float = rect.y
            bottom: float = rect.y + rect.height

            # Update min and max values
            min_x = min(min_x, left)
            max_x = max(max_x, right)
            min_y = min(min_y, top)
            max_y = max(max_y, bottom)

        # Calculate the width, height, and the center coordinates of the encompassing rectangle
        width: float = max_x - min_x
        height: float = max_y - min_y
        center_x: float = (min_x + max_x) / 2
        center_y: float = (min_y + max_y) / 2

        # Create and return a new Rectangle object representing the encompassing rectangle
        return Rectangle(
            id=-1,  # Assign a special id for the encompassing rectangle
            x=center_x - width / 2,
            y=center_y - height / 2,
            width=width + 10,
            height=height + 10
        )

    except ValueError as e:
        print(f"Error in find_encompassing_rectangle: Invalid numeric value - {str(e)}")
        return None
    except AttributeError as e:
        print(f"Error in find_encompassing_rectangle: {str(e)}")
        return None
    except Exception as e:
        print(f"Unexpected error in find_encompassing_rectangle: {str(e)}")
        return None
