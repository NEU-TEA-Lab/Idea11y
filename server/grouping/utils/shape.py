from typing import Tuple, List
import math


def calculate_edges(x: float, y: float, w: float, h: float) -> Tuple[float, float, float, float]:
    return (x - w / 2, x + w / 2, y - h / 2, y + h / 2)


def is_shape_inside_rectangle(outer_x: float, outer_y: float, outer_w: float, outer_h: float,
                                inner_x: float, inner_y: float, inner_w: float, inner_h: float) -> bool:
    outer_left, outer_right, outer_top, outer_bottom = calculate_edges(outer_x, outer_y, outer_w, outer_h)
    inner_left, inner_right, inner_top, inner_bottom = calculate_edges(inner_x, inner_y, inner_w, inner_h)

    return (inner_left >= outer_left and
            inner_right <= outer_right and
            inner_top >= outer_top and
            inner_bottom <= outer_bottom)


def get_corners(x: float, y: float, w: float, h: float) -> List[Tuple[float, float]]:
    left, right, top, bottom = calculate_edges(x, y, w, h)
    return [(left, top), (right, top), (left, bottom), (right, bottom)]


def is_point_inside_ellipse(x: float, y: float, ellipse_x: float, ellipse_y: float,
                            semi_major: float, semi_minor: float) -> bool:
    x_normalized = (x - ellipse_x) / semi_major
    y_normalized = (y - ellipse_y) / semi_minor
    return (x_normalized ** 2 + y_normalized ** 2) <= 1


def is_shape_inside_ellipse(ellipse_x: float, ellipse_y: float, ellipse_w: float, ellipse_h: float,
                            inner_x: float, inner_y: float, inner_w: float, inner_h: float) -> bool:
    a, b = ellipse_w / 2, ellipse_h / 2
    corners = get_corners(inner_x, inner_y, inner_w, inner_h)
    return all(is_point_inside_ellipse(x, y, ellipse_x, ellipse_y, a, b) for x, y in corners)
