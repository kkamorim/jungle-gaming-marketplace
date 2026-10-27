import { useState, type FormEvent } from 'react';
import { AlertCircle, Eye, EyeOff, Loader2, X } from 'lucide-react';
import { useUI } from '../../context/UIContext';
import { useAuth } from '../../context/AuthContext';

export function AuthModal() {
  const { authModal, closeAuthModal, openAuthModal, addToast } = useUI();
  const { login, register } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!authModal) return null;

  const isLogin = authModal === 'login';

  const switchMode = (mode: 'login' | 'register') => {
    setError(null);
    openAuthModal(mode);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (isLogin) {
        await login({ email, password });
        addToast({
          type: 'success',
          title: 'Sessão iniciada',
          description: 'Bem-vindo de volta à Kurio!',
        });
      } else {
        if (password !== confirmPassword) {
          setError('As senhas não coincidem');
          setIsLoading(false);
          return;
        }

        await register({
          email,
          password,
          displayName: displayName || username,
          username,
        });
        addToast({
          type: 'success',
          title: 'Conta criada!',
          description: 'Seu perfil de colecionador está pronto.',
        });
      }
      closeAuthModal();
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          (isLogin ? 'E-mail ou senha inválidos' : 'Erro ao criar conta. Tente outro usuário ou e-mail.')
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    addToast({
      type: 'info',
      title: 'Redefinição de senha',
      description: 'A recuperação de senha será enviada quando o serviço de e-mail estiver conectado.',
    });
  };

  const handleDirectDemoLogin = async (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError(null);
    setIsLoading(true);

    try {
      await login({ email: demoEmail, password: demoPassword });
      addToast({
        type: 'success',
        title: 'Sessão iniciada',
        description: 'Conectado com sucesso como ' + demoEmail + '!',
      });
      closeAuthModal();
    } catch {
      setError('Falha na autenticação rápida.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (provider: 'Google' | 'Facebook') => {
    addToast({
      type: 'info',
      title: 'Continuar com ' + provider,
      description: 'O login com ' + provider + ' será ativado quando o OAuth estiver conectado.',
    });
  };

  return (
    <div
      className='fixed inset-0 z-[250] flex min-h-full items-center justify-center overflow-y-auto bg-[#241511]/95 p-0 sm:p-4'
      role='dialog'
      aria-modal='true'
      aria-labelledby='auth-modal-title'
    >
      <button
        type='button'
        onClick={closeAuthModal}
        className='absolute right-3 top-3 z-20 rounded p-2 text-[#D28A4C] transition-colors hover:bg-[#352018] hover:text-[#F5A047] sm:right-5 sm:top-5'
        aria-label='Fechar modal de autenticação'
      >
        <X className='h-5 w-5' />
      </button>

      <div className='relative flex min-h-[100dvh] w-full max-w-[492px] flex-col justify-center border-x border-[#35271C] bg-[#241511] px-8 py-12 shadow-2xl sm:min-h-0 sm:rounded-xl sm:border sm:px-10 sm:py-10'>
        <div className='mb-8 text-center'>
          <div className='flex items-center justify-center gap-2 font-heading text-[21px] font-bold tracking-wide text-[#F1ECE6]'>
            <button
              type='button'
              onClick={() => switchMode('login')}
              className={'transition-colors ' + (isLogin ? 'text-[#E39A52]' : 'text-[#F1ECE6] hover:text-[#E39A52]')}
            >
              Entrar
            </button>
            <span className='font-normal text-[#B57B4C]'>|</span>
            <button
              type='button'
              onClick={() => switchMode('register')}
              className={'transition-colors ' + (!isLogin ? 'text-[#E39A52]' : 'text-[#F1ECE6] hover:text-[#E39A52]')}
            >
              Criar conta
            </button>
          </div>
          <p id='auth-modal-title' className='mx-auto mt-8 max-w-[390px] text-center font-mono text-[13px] leading-5 text-[#E5D8CD]'>
            {isLogin
              ? 'Entre para gerenciar sua carteira, coleção e perfil de criador.'
              : 'Crie sua conta para colecionar arte digital e acompanhar seus criadores favoritos.'}
          </p>
        </div>

        {isLogin && (
          <div className='mb-5 rounded-md border border-[#4A2A1C] bg-[#21130F] p-3'>
            <p className='mb-2 font-mono text-[10px] uppercase tracking-wider text-[#B98A5B]'>Acesso rápido · dados mockados</p>
            <div className='grid gap-2 sm:grid-cols-2'>
              <button
                type='button'
                disabled={isLoading}
                onClick={() => handleDirectDemoLogin('davi@kurio.com', 'Senha@123')}
                className='rounded border border-[#4A2A1C] bg-[#2B1912] px-2 py-2 text-left font-mono text-[10px] text-[#D9C8B8] transition-colors hover:border-[#D28A4C] hover:text-white disabled:cursor-wait disabled:opacity-60'
              >
                <span className='block font-semibold text-white'>Davi</span>
                davi@kurio.com
              </button>
              <button
                type='button'
                disabled={isLoading}
                onClick={() => handleDirectDemoLogin('ana@kurio.com', 'Senha@456')}
                className='rounded border border-[#4A2A1C] bg-[#2B1912] px-2 py-2 text-left font-mono text-[10px] text-[#D9C8B8] transition-colors hover:border-[#D28A4C] hover:text-white disabled:cursor-wait disabled:opacity-60'
              >
                <span className='block font-semibold text-white'>Ana</span>
                ana@kurio.com
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className='space-y-3.5'>
          {!isLogin && (
            <>
              <input
                type='text'
                required
                placeholder='Nome de usuário'
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                className='h-10 w-full rounded-md border border-[#4A2A1C] bg-[#21130F] px-4 font-mono text-sm text-white outline-none transition-colors placeholder:text-[#AA825F] focus:border-[#D28A4C]'
              />
              <input
                type='text'
                placeholder='Nome de exibição'
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                className='h-10 w-full rounded-md border border-[#4A2A1C] bg-[#21130F] px-4 font-mono text-sm text-white outline-none transition-colors placeholder:text-[#AA825F] focus:border-[#D28A4C]'
              />
            </>
          )}

          <input
            type='email'
            required
            placeholder='contato@email.com'
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className='h-10 w-full rounded-md border border-[#4A2A1C] bg-[#21130F] px-4 font-mono text-sm text-white outline-none transition-colors placeholder:text-[#AA825F] focus:border-[#D28A4C]'
          />

          <div className='relative'>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              placeholder='••••••••••••'
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className='h-10 w-full rounded-md border border-[#D28A4C] bg-[#21130F] px-4 pr-11 font-mono text-sm text-white outline-none transition-colors placeholder:text-[#D7C8BB] focus:border-[#F5A047]'
            />
            <button
              type='button'
              onClick={() => setShowPassword((current) => !current)}
              className='absolute right-3 top-1/2 -translate-y-1/2 text-[#B28A62] transition-colors hover:text-[#F5A047]'
              aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
            >
              {showPassword ? <EyeOff className='h-5 w-5' /> : <Eye className='h-5 w-5' />}
            </button>
          </div>

          {!isLogin && (
            <div className='relative'>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                required
                placeholder='Confirme sua senha'
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className='h-10 w-full rounded-md border border-[#4A2A1C] bg-[#21130F] px-4 pr-11 font-mono text-sm text-white outline-none transition-colors placeholder:text-[#AA825F] focus:border-[#D28A4C]'
              />
              <button
                type='button'
                onClick={() => setShowConfirmPassword((current) => !current)}
                className='absolute right-3 top-1/2 -translate-y-1/2 text-[#B28A62] transition-colors hover:text-[#F5A047]'
                aria-label={showConfirmPassword ? 'Ocultar confirmação de senha' : 'Mostrar confirmação de senha'}
              >
                {showConfirmPassword ? <EyeOff className='h-5 w-5' /> : <Eye className='h-5 w-5' />}
              </button>
            </div>
          )}

          {isLogin && (
            <div className='flex justify-end'>
              <button type='button' onClick={handleForgotPassword} className='font-mono text-sm text-[#E39A52] transition-colors hover:text-[#F5A047] hover:underline'>
                Esqueceu a senha?
              </button>
            </div>
          )}

          {error && (
            <div className='flex items-center gap-2 rounded-md border border-red-500/40 bg-red-950/30 p-3 text-xs text-red-300'>
              <AlertCircle className='h-4 w-4 shrink-0' />
              <span>{error}</span>
            </div>
          )}

          <button
            type='submit'
            disabled={isLoading}
            className='mt-2 flex h-11 w-full items-center justify-center rounded-md bg-[#D78D4A] font-heading text-base font-bold text-[#1B110D] transition-colors hover:bg-[#E6A05A] disabled:cursor-wait disabled:opacity-70'
          >
            {isLoading ? <Loader2 className='h-5 w-5 animate-spin' /> : isLogin ? 'Entrar' : 'Criar conta'}
          </button>
        </form>

        <div className='my-6 flex items-center gap-3 text-center font-mono text-xs text-[#E5D8CD]'>
          <span className='h-px flex-1 bg-[#39231A]' />
          <span className='shrink-0'>Ou continue com</span>
          <span className='h-px flex-1 bg-[#39231A]' />
        </div>

        <div className='space-y-3'>
          <button
            type='button'
            onClick={() => handleSocialLogin('Google')}
            className='flex h-10 w-full items-center justify-center gap-3 rounded-md border border-[#4A2A1C] bg-transparent font-mono text-sm text-[#D9C8B8] transition-colors hover:border-[#D28A4C] hover:bg-[#2B1912]'
          >
            <span className='font-sans text-xl font-bold leading-none text-[#4285F4]'>G</span>
            Continuar com Google
          </button>
          <button
            type='button'
            onClick={() => handleSocialLogin('Facebook')}
            className='flex h-10 w-full items-center justify-center gap-3 rounded-md border border-[#4A2A1C] bg-transparent font-mono text-sm text-[#D9C8B8] transition-colors hover:border-[#D28A4C] hover:bg-[#2B1912]'
          >
            <span className='font-sans text-xl font-bold leading-none text-[#4267B2]'>f</span>
            Continuar com Facebook
          </button>
        </div>
      </div>
    </div>
  );
}
