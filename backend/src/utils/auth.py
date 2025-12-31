"""Authentication Utility Functions"""

import bcrypt


def hash_password(password: str) -> str:
    """비밀번호 해싱

    Args:
        password: 해싱할 비밀번호

    Returns:
        str: 해싱된 비밀번호

    Note:
        bcrypt는 72바이트 제한이 있으므로 자동으로 잘라냄
    """
    # bcrypt는 72바이트 제한이 있으므로 잘라냄
    password_bytes = password.encode('utf-8')[:72]
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password_bytes, salt)
    return hashed.decode('utf-8')
